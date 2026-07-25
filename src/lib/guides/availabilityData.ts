import "server-only"
import { createClient } from "@/lib/supabase/server"
import { occupiesDate, resolveDayState, toDateKey } from "@/lib/guides/availability"

/**
 * Blocked + booked date keys for one guide inside an inclusive window.
 *
 * `booked` is derived from guide_bookings rather than stored, so a sale closes
 * the day with no extra write.
 *
 * Unpaid holds are included while they last. That reverses the earlier rule
 * here — pending rows used to be ignored so nobody could squat a guide's day —
 * because payment is now what confirms a booking, and a date has to be reserved
 * for the minutes a traveller spends at checkout. The squatting problem is
 * handled by the hold expiring instead (see `occupiesDate`).
 */
export async function loadAvailability(
  guideId: string,
  from: string,
  to: string
): Promise<{ blocked: string[]; booked: string[] }> {
  const supabase = await createClient()

  const [{ data: blockedRows }, { data: bookedRows }] = await Promise.all([
    supabase
      .from("guide_unavailable_dates")
      .select("date")
      .eq("guide_id", guideId)
      .gte("date", from)
      .lte("date", to),
    supabase
      .from("guide_bookings")
      .select("trip_date, status, hold_expires_at")
      .eq("guide_id", guideId)
      .in("status", ["confirmed", "completed", "awaiting_payment"])
      .gte("trip_date", from)
      .lte("trip_date", to),
  ])

  // Expiry is filtered here rather than in the query so the rule for which rows
  // occupy a date lives in one tested place alongside resolveDayState.
  const now = Date.now()
  const booked = (bookedRows ?? [])
    .filter((r: { status: string; hold_expires_at: string | null }) =>
      occupiesDate(r, now)
    )
    .map((r: { trip_date: string }) => r.trip_date)

  return {
    blocked: (blockedRows ?? []).map((r: { date: string }) => r.date),
    booked,
  }
}

/**
 * Authoritative check used by the booking API. The calendar disabling a day is
 * a convenience; this is the rule.
 */
export async function isDateBookable(guideId: string, date: string): Promise<boolean> {
  const { blocked, booked } = await loadAvailability(guideId, date, date)
  const state = resolveDayState(date, {
    today: toDateKey(new Date()),
    blocked: new Set(blocked),
    booked: new Set(booked),
  })
  return state === "available"
}
