import { NextResponse } from "next/server"
import { getBookingForViewer } from "@/lib/bookings"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const booking = await getBookingForViewer(id)

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ data: booking })
}
