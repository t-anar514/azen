import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { SIGNATURE_HEADER, verifyWebhookSignature } from "@/lib/payments/wireSignature"

/**
 * `POST /api/webhooks/wire` — the only thing that turns a hold into a confirmed
 * booking.
 *
 * The redirect back from checkout is never trusted: a traveler can reach the
 * success URL by typing it. Wire's own docs say to confirm server-side from
 * `payment_intent.succeeded`, and that is what happens here.
 *
 * The endpoint is unauthenticated by necessity — Wire's servers call it, not a
 * logged-in user — so the signature is the authentication. `middleware.ts`
 * already excludes `/api`, so nothing intercepts or redirects this route.
 */

// Force the node runtime: signature verification uses node:crypto.
export const runtime = "nodejs"

interface WireEvent {
  id?: string
  type?: string
  data?: { object?: { id?: string; status?: string } }
}

export async function POST(req: Request) {
  // Raw, unparsed body. Parsing first changes the bytes and the HMAC will not
  // match — Wire's docs call this out explicitly.
  const rawBody = await req.text()

  const verdict = verifyWebhookSignature({
    rawBody,
    header: req.headers.get(SIGNATURE_HEADER) ?? req.headers.get(SIGNATURE_HEADER.toLowerCase()),
    secret: process.env.WIRE_WEBHOOK_SECRET ?? "",
  })
  if (!verdict.ok) {
    // Deliberately terse: a caller failing verification learns nothing about
    // why beyond the fact that it failed.
    return NextResponse.json({ error: "bad signature" }, { status: 400 })
  }

  let event: WireEvent
  try {
    event = JSON.parse(rawBody) as WireEvent
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 })
  }

  const eventId = event.id
  if (!eventId) return NextResponse.json({ error: "missing event id" }, { status: 400 })

  const admin = createAdminClient()

  // Dedupe first. Wire's docs warn the same event may be delivered more than
  // once; the primary key makes a redelivery a conflict rather than a second
  // confirmation. Recording before acting means a crash mid-handler replays
  // safely on the next delivery only if the insert itself succeeded — and every
  // step after this point is idempotent anyway.
  const { error: seenError } = await admin
    .from("wire_webhook_events")
    .insert({ event_id: eventId, event_type: event.type ?? null })

  if (seenError) {
    // Unique violation = already handled. Acknowledge so Wire stops retrying.
    if (seenError.code === "23505") return NextResponse.json({ ok: true, duplicate: true })
    return NextResponse.json({ error: "could not record event" }, { status: 500 })
  }

  if (event.type !== "payment_intent.succeeded") {
    // Acknowledged and ignored — an unhandled type is not an error, and
    // returning non-2xx would make Wire retry it forever.
    return NextResponse.json({ ok: true, ignored: event.type ?? null })
  }

  const intentId = event.data?.object?.id
  if (!intentId) return NextResponse.json({ error: "missing payment intent id" }, { status: 400 })

  // The payment row written at checkout is what maps an intent back to a
  // booking; the intent id never comes from the client.
  const { data: payment } = await admin
    .from("payments")
    .select("id, guide_booking_id")
    .eq("wire_payment_intent_id", intentId)
    .maybeSingle()

  if (!payment?.guide_booking_id) {
    // 2xx on purpose: retrying will not conjure a row we never wrote, and this
    // is the shape a transfer-parented or foreign intent would take.
    return NextResponse.json({ ok: true, unmatched: true })
  }

  await admin
    .from("payments")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", payment.id)

  // Scoped to awaiting_payment so a late duplicate cannot resurrect a booking
  // that expired or was cancelled, and cannot overwrite a completed one.
  const { data: confirmed } = await admin
    .from("guide_bookings")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", payment.guide_booking_id)
    .eq("status", "awaiting_payment")
    .select("id")

  // A paid booking whose hold already expired is the one case a human needs to
  // see: the money arrived but the date may have been taken by someone else.
  const stale = !confirmed?.length

  return NextResponse.json({ ok: true, confirmed: !stale, needsReview: stale })
}
