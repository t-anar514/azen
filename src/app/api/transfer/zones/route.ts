import { NextResponse } from "next/server"
import { getZonesForAirport } from "@/lib/transfers/pricing"

// Public — feeds the dropoff-zone select on the booking form once a pickup
// airport is chosen. GET /api/transfer/zones?airport_code=NRT
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const airportCode = searchParams.get("airport_code")

  if (!airportCode) {
    return NextResponse.json({ error: "airport_code is required" }, { status: 400 })
  }

  const zones = await getZonesForAirport(airportCode)
  return NextResponse.json({ data: zones })
}
