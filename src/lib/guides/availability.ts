/**
 * Availability model for guide bookings.
 *
 * Blocklist: a guide is bookable unless a `guide_unavailable_dates` row says
 * otherwise. `resolveDayState` is the single source of truth — both the studio
 * editor and the public booking calendar derive from it, so the two views
 * cannot disagree about whether a day is open.
 */

export type DayState = "past" | "booked" | "blocked" | "available"

/** How far ahead the calendar lets anyone look or block. */
export const MAX_MONTHS_AHEAD = 12

/** Upper bound on one block/unblock request, so a range can't bulk-insert. */
export const MAX_BATCH_DATES = 365

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

export function isValidDateKey(v: unknown): v is string {
  return typeof v === "string" && DATE_KEY.test(v)
}

/**
 * Local "YYYY-MM-DD". Deliberately not toISOString().slice(0,10) — that
 * converts to UTC first, so 00:30 on Aug 1 in a UTC-behind zone becomes
 * Jul 31 and the guide blocks the wrong day.
 */
export function toDateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

/**
 * Precedence: past → booked → blocked → available.
 *
 * `booked` outranks `blocked` so a day the guide already sold renders as sold
 * and stays non-interactive; letting them "unblock" it would reopen a day
 * that is genuinely gone.
 *
 * Date keys are zero-padded and fixed-width, so string comparison is
 * chronological and no Date parsing is needed here.
 */
export function resolveDayState(
  date: string,
  opts: { today: string; blocked: Set<string>; booked: Set<string> }
): DayState {
  if (date < opts.today) return "past"
  if (opts.booked.has(date)) return "booked"
  if (opts.blocked.has(date)) return "blocked"
  return "available"
}
