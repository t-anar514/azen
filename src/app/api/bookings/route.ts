import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateTripCode } from "@/lib/bookings"
import { quoteTransferPrice } from "@/lib/transfers/pricing"

// Public endpoint — booking a transfer doesn't require an account (guest
// checkout, per the brief). If the requester happens to be logged in, the
// booking is still linked to their user_id so it shows up in /transfer/history.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const required = [
    "guest_name",
    "guest_email",
    "guest_phone",
    "flight_number",
    "flight_direction",
    "pickup_datetime",
    "pickup_location",
    "dropoff_location",
    "vehicle_option_id",
  ] as const

  for (const key of required) {
    if (!body[key] || typeof body[key] !== "string") {
      return NextResponse.json({ error: `${key} is required` }, { status: 400 })
    }
  }

  if (body.flight_direction !== "arrival" && body.flight_direction !== "departure") {
    return NextResponse.json({ error: "flight_direction must be 'arrival' or 'departure'" }, { status: 400 })
  }

  // zone_id is nullable — a guest can type a one-off address that isn't in
  // the curated zone list yet, which quoteTransferPrice() handles by falling
  // back to the vehicle's flat starting price. But if one *was* provided it
  // must be a string, not something a tampered request could smuggle other
  // types through as.
  const zoneId: string | null = body.zone_id ?? null
  if (zoneId !== null && typeof zoneId !== "string") {
    return NextResponse.json({ error: "zone_id must be a string or null" }, { status: 400 })
  }

  // Price is always computed here from the vehicle + zone, never trusted
  // from the client — otherwise a tampered request could book at any price.
  const quote = await quoteTransferPrice({ vehicleOptionId: body.vehicle_option_id, zoneId })

  if (!quote) {
    return NextResponse.json({ error: "Selected vehicle is not available" }, { status: 400 })
  }

  let booking = null
  let lastError: { message: string } | null = null

  // Retry a couple of times in the (very unlikely) event of a trip_code collision.
  for (let attempt = 0; attempt < 3 && !booking; attempt++) {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        trip_code: generateTripCode(),
        user_id: user?.id ?? null,
        guest_name: body.guest_name,
        guest_email: body.guest_email,
        guest_phone: body.guest_phone,
        flight_number: body.flight_number,
        flight_direction: body.flight_direction,
        pickup_datetime: body.pickup_datetime,
        pickup_location: body.pickup_location,
        dropoff_location: body.dropoff_location,
        vehicle_option_id: body.vehicle_option_id,
        price: quote.price,
        currency: quote.currency,
        zone_id: zoneId,
        distance_km: quote.distanceKm,
        pricing_source: quote.source,
        notes: body.notes ?? null,
      })
      .select()
      .single()

    if (data) booking = data
    else lastError = error
  }

  if (!booking) {
    return NextResponse.json({ error: lastError?.message || "Failed to create booking" }, { status: 500 })
  }

  await supabase.from("payments").insert({
    booking_id: booking.id,
    amount: booking.price,
    currency: booking.currency,
    provider: "qpay",
    status: "pending",
  })

  return NextResponse.json({ data: booking }, { status: 201 })
}
