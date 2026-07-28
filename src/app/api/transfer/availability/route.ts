import { NextResponse } from "next/server"

import { loadSlotAvailability, TRAVELER_WINDOW_DAYS, todayKey } from "@/lib/drivers/scheduleData"
import { addDays, isValidDateKey } from "@/lib/drivers/shifts"

/**
 * `GET /api/transfer/availability?from=&to=` — anonymous vehicle counts per
 * day and slot.
 *
 * Public by design: the booking calendar has to work for a guest checkout.
 * What keeps that safe is the shape of the answer rather than a permission —
 * it comes from `driver_slot_availability()`, which aggregates away the driver
 * ids before the data leaves Postgres. There is no public read on
 * `driver_shifts` itself, so this route cannot be coaxed into naming anybody.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const today = todayKey()

  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")

  const start = isValidDateKey(from) && from >= today ? from : today
  const requestedEnd = isValidDateKey(to) ? to : addDays(start, TRAVELER_WINDOW_DAYS)

  // Clamped so a crafted `to` cannot ask the database to aggregate a decade.
  const maxEnd = addDays(start, TRAVELER_WINDOW_DAYS)
  const end = requestedEnd > maxEnd ? maxEnd : requestedEnd
  if (end < start) {
    return NextResponse.json({ error: "to must not precede from" }, { status: 400 })
  }

  const slots = await loadSlotAvailability(start, end)
  return NextResponse.json({ from: start, to: end, slots })
}
