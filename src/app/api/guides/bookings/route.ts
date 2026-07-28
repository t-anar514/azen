import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  // Payment is required. Direct clients to POST /api/bookings/checkout instead,
  // which takes a hold and returns a Wire checkout URL.
  return NextResponse.json(
    { error: "use POST /api/bookings/checkout for payment" },
    { status: 405 }
  )
}

/**
 * Statuses a guide may set.
 *
 * `confirmed` and `declined` are both gone: an available date needs no
 * approval, so the payment webhook is the only thing that confirms a booking.
 * A guide who cannot make it cancels instead, which frees the date — the
 * uq_guide_date index only covers awaiting_payment / confirmed / completed.
 *
 * Cancelling moves no money: Azen does not refund. The payment row is left
 * exactly as it is, and nothing here should imply a refund to either side.
 */
const GUIDE_SETTABLE = ["completed", "cancelled"] as const

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })

  const { id, status } = await req.json().catch(() => ({}))
  if (!id || !GUIDE_SETTABLE.includes(status))
    return NextResponse.json({ error: "invalid" }, { status: 400 })

  // RLS gb_guide_update ensures only the owning guide can update
  const { data, error } = await supabase.from("guide_bookings")
    .update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    .select("id")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data?.length) return NextResponse.json({ error: "not found" }, { status: 404 })

  return NextResponse.json({ ok: true })
}
