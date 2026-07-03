import { NextResponse } from "next/server"
import { quoteTransferPrice } from "@/lib/transfers/pricing"

// Public — the booking form calls this on every pickup/dropoff/vehicle
// change to show a live price before submitting. The same quote logic runs
// again server-side in POST /api/bookings, so nothing here needs to be
// trusted as the final price.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.vehicle_option_id || typeof body.vehicle_option_id !== "string") {
    return NextResponse.json({ error: "vehicle_option_id is required" }, { status: 400 })
  }

  const quote = await quoteTransferPrice({
    vehicleOptionId: body.vehicle_option_id,
    zoneId: body.zone_id ?? null,
  })

  if (!quote) {
    return NextResponse.json({ error: "Selected vehicle is not available" }, { status: 400 })
  }

  return NextResponse.json({ data: quote })
}
