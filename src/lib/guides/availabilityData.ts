import "server-only"
import { createClient } from "@/lib/supabase/server"
import { resolveDayState, toDateKey } from "@/lib/guides/availability"

/**
 * Blocked + booked date keys for one guide inside an inclusive window.
 *
 * `booked` is derived from confirmed guide_bookings rather than stored, so
 * accepting a trip closes the day with no extra write and declining reopens it.
 * Pending requests deliberately do not appear — otherwise one traveller who
 * never pays could hold a guide's day hostage.
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
      .select("trip_date")
      .eq("guide_id", guideId)
      .eq("status", "confirmed")
      .gte("trip_date", from)
      .lte("trip_date", to),
  ])

  return {
    blocked: (blockedRows ?? []).map((r: { date: string }) => r.date),
    booked: (bookedRows ?? []).map((r: { trip_date: string }) => r.trip_date),
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
