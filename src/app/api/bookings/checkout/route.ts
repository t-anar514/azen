import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  generateBookingCode,
  INTEREST_OPTIONS,
  NOTE_MAX_LENGTH,
  quoteBooking,
} from "@/lib/guides/booking"
import { FALLBACK_RATES } from "@/lib/currency/format"
import { isUsableRate, jpyToTogrog, toWireAmount } from "@/lib/payments/money"
import {
  WireError,
  createCheckoutSession,
  createPaymentIntent,
} from "@/lib/payments/wireClient"

/**
 * `POST /api/bookings/checkout` — take a hold on a date and hand back a Wire
 * checkout URL.
 *
 * The traveler pays up front and the guide cannot decline, so this route is
 * where a date stops being available. Two rules follow from that:
 *
 *  - money is computed here from `guides.price`, never read from the request
 *    body, and
 *  - the hold is taken through `create_booking_hold` (service-role only), so
 *    the unique index — not an application-level check — decides who wins a
 *    race for the same date.
 */

/** Postgres error codes the hold RPC can surface. */
const UNIQUE_VIOLATION = "23505"
const CHECK_VIOLATION = "23514"

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })

  const { guideId, tripDate, hours, city, note, startTime, interests } = await req
    .json()
    .catch(() => ({}))

  const h = Number(hours)
  if (!guideId || !tripDate || !h || h <= 0 || !Number.isInteger(h)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(tripDate))) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 })
  }
  if (startTime != null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(startTime))) {
    return NextResponse.json({ error: "invalid start time" }, { status: 400 })
  }

  const tags = Array.isArray(interests)
    ? interests.filter((i): i is string => INTEREST_OPTIONS.includes(i))
    : []

  const { data: guide } = await supabase
    .from("guides")
    .select("price, name")
    .eq("id", guideId)
    .single()
  if (!guide) return NextResponse.json({ error: "no guide" }, { status: 404 })

  // Two different numbers, and mixing them up is why the service fee used to be
  // given away: `subtotal` is the guide's payout (what /studio's earnings sum),
  // `total` is what the traveler is charged and what the dialog quotes them.
  // 0024 spells out the same split — "amount stays the JPY guide payout,
  // amount_mnt is what Wire actually charges".
  const { subtotal: payoutJpy, total: chargeJpy } = quoteBooking(
    Number(guide.price ?? 0),
    h
  )
  if (payoutJpy <= 0) {
    return NextResponse.json({ error: "guide has no price set" }, { status: 409 })
  }

  // The rate is read once and written onto the booking, so a later dispute can
  // be reconstructed from the row rather than from whatever the rate is today.
  const { data: rateRow } = await supabase
    .from("exchange_rates")
    .select("rates")
    .eq("id", 1)
    .single()
  const rates = (rateRow?.rates ?? FALLBACK_RATES) as Record<string, number>
  const fxRate = rates.MNT
  if (!isUsableRate(fxRate)) {
    // Charging 0 ₮ would be far worse than refusing to sell.
    return NextResponse.json({ error: "exchange rate unavailable" }, { status: 503 })
  }

  // Only the charge is converted — the payout stays in JPY on the booking row.
  const chargeMnt = jpyToTogrog(chargeJpy, fxRate)
  const wireAmount = toWireAmount(chargeMnt)

  // Service role: create_booking_hold is not callable by `authenticated`, by
  // design — see 0024. The verified user id is passed rather than trusted from
  // the body.
  const admin = createAdminClient()
  const { data: held, error: holdError } = await admin.rpc("create_booking_hold", {
    p_guide_id: guideId,
    p_traveler_id: user.id,
    p_trip_date: tripDate,
    p_hours: h,
    p_amount: payoutJpy,
    p_amount_mnt: chargeMnt,
    p_fx_rate: fxRate,
    p_code: generateBookingCode(),
    p_city: city ?? null,
    p_note: note ? String(note).slice(0, NOTE_MAX_LENGTH) : null,
    p_start_time: startTime ?? null,
    p_interests: tags,
  })

  if (holdError) {
    if (holdError.code === UNIQUE_VIOLATION) {
      return NextResponse.json({ error: "date already booked" }, { status: 409 })
    }
    if (holdError.code === CHECK_VIOLATION) {
      return NextResponse.json(
        { error: holdError.message.includes("date_blocked") ? "date blocked" : "date in the past" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: holdError.message }, { status: 400 })
  }

  // PostgREST hands back a bare object for a composite-returning function and
  // an array for a SETOF one. Accepting either keeps this from breaking if the
  // function's return type is ever adjusted server-side.
  const booking = (Array.isArray(held) ? held[0] : held) as
    | { id: string; code: string | null }
    | null
    | undefined
  if (!booking?.id) {
    return NextResponse.json({ error: "hold failed" }, { status: 500 })
  }
  const bookingId = booking.id

  /** A Wire failure must not leave the date locked until the hold times out.
   *  Scoped to `awaiting_payment` so this can never demote a booking that the
   *  webhook confirmed in the meantime. */
  async function releaseHold() {
    await admin
      .from("guide_bookings")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", bookingId)
      .eq("status", "awaiting_payment")
  }

  try {
    // Idempotency keys are derived from the booking id, so a retry of this
    // request reuses the original intent instead of charging twice.
    const intent = await createPaymentIntent({
      amount: wireAmount,
      description: `Azen · ${guide.name} · ${tripDate}`,
      idempotencyKey: `booking-${bookingId}`,
    })

    const origin = new URL(req.url).origin
    const session = await createCheckoutSession({
      paymentIntentId: intent.id,
      // The confirmation page waits for the webhook to confirm the payment
      successUrl: `${origin}/mn/booking/${bookingId}`,
      idempotencyKey: `sess-${bookingId}`,
    })

    // Service role: payments_insert deliberately refuses guide-parented rows
    // from any client (0024).
    const { error: payErr } = await admin.from("payments").insert({
      guide_booking_id: bookingId,
      amount: chargeJpy,
      amount_mnt: chargeMnt,
      currency: "MNT",
      provider: "wire",
      status: "pending",
      wire_payment_intent_id: intent.id,
      wire_checkout_session_id: session.id,
    })
    if (payErr) {
      // Without this row the webhook cannot match the intent back to a booking,
      // so there is no point sending the traveler to pay.
      await releaseHold()
      return NextResponse.json({ error: "could not record payment" }, { status: 500 })
    }

    return NextResponse.json({
      url: session.url,
      bookingId,
      code: booking.code,
      amountMnt: chargeMnt,
    })
  } catch (e) {
    await releaseHold()
    if (e instanceof WireError) {
      return NextResponse.json(
        { error: "payment provider error", code: e.code, requestId: e.requestId },
        { status: 502 }
      )
    }
    return NextResponse.json({ error: "checkout failed" }, { status: 500 })
  }
}
