import "server-only"
import { createClient } from "@/lib/supabase/server"
import { addDays, toDateKey, type ShiftRow, type SlotAvailability } from "@/lib/drivers/shifts"
import type {
  DriverShiftTemplateRow,
  ShiftCoverageRow,
  SlotAvailabilityRow,
} from "@/lib/supabase/types"

/** How far ahead every schedule surface looks by default. */
export const COVERAGE_DAYS = 14
export const TRAVELER_WINDOW_DAYS = 60

export function todayKey(): string {
  return toDateKey(new Date())
}

/** Auto-extend kicks in once the horizon drops below this. */
export const TOP_UP_THRESHOLD_DAYS = 14
export const TOP_UP_WEEKS = 4

/**
 * Keeps an auto-extending driver's horizon from lapsing.
 *
 * Called when the driver opens their studio, which is the honest limitation:
 * a driver who never visits still runs out. Doing it here rather than not at
 * all is worth it because the common failure is a driver who checks in weekly
 * and assumes their calendar rolls forward on its own — exactly what the switch
 * promises. A scheduled job over every auto-extend driver would remove the
 * dependency on a visit; the RPC is idempotent, so it can be added later
 * without changing anything here.
 *
 * Returns the new horizon when it moved, otherwise null.
 */
export async function topUpSchedule(driver: {
  schedule_auto_extend: boolean
  schedule_open_until: string | null
}): Promise<string | null> {
  if (!driver.schedule_auto_extend) return null

  const threshold = addDays(todayKey(), TOP_UP_THRESHOLD_DAYS)
  if (driver.schedule_open_until && driver.schedule_open_until > threshold) return null

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("open_driver_shifts", { p_weeks: TOP_UP_WEEKS })
  // A driver with no template yet has nothing to stamp; that is not an error
  // worth failing a page render over.
  if (error) return null
  return (data as string | null) ?? null
}

/** One driver's opened slots in an inclusive window. RLS scopes this to the
 *  owner (or an admin) — see the `ds_owner_read` policy in 0025. */
export async function loadDriverShifts(
  driverId: string,
  from: string,
  to: string
): Promise<ShiftRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("driver_shifts")
    .select("date, slot, capacity, booked_count")
    .eq("driver_id", driverId)
    .gte("date", from)
    .lte("date", to)
    .order("date")
  return (data ?? []) as ShiftRow[]
}

export async function loadDriverTemplate(driverId: string): Promise<DriverShiftTemplateRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("driver_shift_templates")
    .select("*")
    .eq("driver_id", driverId)
    .order("weekday")
  return (data ?? []) as DriverShiftTemplateRow[]
}

/**
 * Capacity totals for the traveler's calendar.
 *
 * Goes through the `driver_slot_availability` RPC rather than selecting from
 * driver_shifts, and that is the whole point: there is no public read policy on
 * that table, so this is the only path anonymous traffic has to the numbers —
 * and it returns totals with no driver id attached.
 */
export async function loadSlotAvailability(
  from: string,
  to: string
): Promise<SlotAvailability[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("driver_slot_availability", {
    p_from: from,
    p_to: to,
  })
  // An empty calendar is the correct render for "nobody has opened anything",
  // and it is also the safe render if the RPC is missing — better than a
  // 500 on the booking page.
  if (error) return []
  return (data ?? []) as SlotAvailabilityRow[]
}

/**
 * The 14-day bars on /admin/drivers. Returns one entry per day in the window,
 * including days nobody opened — a gap is the single most important thing this
 * chart has to show, so it cannot be a missing row.
 */
export async function loadCoverage(
  from: string,
  days: number = COVERAGE_DAYS
): Promise<ShiftCoverageRow[]> {
  const supabase = await createClient()
  const to = addDays(from, days - 1)
  const { data } = await supabase.rpc("driver_shift_coverage", { p_from: from, p_to: to })

  const byDate = new Map<string, ShiftCoverageRow>(
    ((data ?? []) as ShiftCoverageRow[]).map((r) => [r.date, r])
  )

  return Array.from({ length: days }, (_, i) => {
    const date = addDays(from, i)
    return (
      byDate.get(date) ?? { date, drivers_open: 0, vehicles_open: 0, vehicles_booked: 0 }
    )
  })
}
