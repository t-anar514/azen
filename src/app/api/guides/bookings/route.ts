import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  generateBookingCode,
  INTEREST_OPTIONS,
  NOTE_MAX_LENGTH,
} from "@/lib/guides/booking"
import { isDateBookable } from "@/lib/guides/availabilityData"

export async function POST(req: Request) {
  // Payment is required. Direct clients to POST /api/bookings/checkout instead,
  // which takes a hold and returns a Wire checkout URL.
  return NextResponse.json(
    { error: "use POST /api/bookings/checkout for payment" },
    { status: 405 }
  )
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })

  const { id, status } = await req.json().catch(() => ({}))
  const allowed = ["confirmed", "declined", "completed", "cancelled"]
  if (!id || !allowed.includes(status))
    return NextResponse.json({ error: "invalid" }, { status: 400 })

  // RLS gb_guide_update ensures only the owning guide can update
  const { data, error } = await supabase.from("guide_bookings")
    .update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    .select("id")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data?.length) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
