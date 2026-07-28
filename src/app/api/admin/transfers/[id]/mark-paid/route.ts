import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"
import { assignDriverForBooking } from "@/lib/drivers/assign"

interface Params {
  params: Promise<{ id: string }>
}

// Stand-in for real QPay webhook handling — flips this booking's payment
// row to 'paid' and the booking itself to 'confirmed' if it was still
// sitting at 'pending_payment'. Remove once a live gateway is wired up.
//
// Since 0025 this is also where a driver gets assigned, because payment is the
// event that assignment hangs off. When a real gateway lands, the two lines
// below move to its webhook together — confirming without claiming would leave
// a paid traveler with no car.
export async function POST(_request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const { error: paymentError } = await supabase
    .from("payments")
    .update({ status: "paid" })
    .eq("booking_id", id)

  if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 500 })

  const { data: booking } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", id)
    .single()

  if (booking?.status === "pending_payment") {
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", id)
    if (bookingError) return NextResponse.json({ error: bookingError.message }, { status: 500 })
  }

  // A failure to find anybody is reported, not thrown: the money is taken and
  // the booking is valid either way, so this must not read as "payment failed".
  const { driverId, error: assignError } = await assignDriverForBooking(id)

  return NextResponse.json({ ok: true, driverId, assignError })
}
