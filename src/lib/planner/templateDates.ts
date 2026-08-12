import { addDays, format } from "date-fns"

/** The month/day a trip named "Намрийн" anchors to. 15 October. */
const AUTUMN_MONTH = 9 // zero-based: October
const AUTUMN_DAY = 15

/**
 * Formats as YYYY-MM-DD in *local* time. `toISOString()` would resolve in UTC
 * and report the previous day for anyone east of Greenwich, which is every
 * user of this site.
 */
export function toIsoDate(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

/**
 * The start date for the autumn template: 15 October of this year, or of next
 * year if that date has already arrived. Keeps a trip named "autumn" actually
 * in autumn no matter when the visitor clicks.
 */
export function nextAutumnStart(today: Date): Date {
  const thisYear = new Date(today.getFullYear(), AUTUMN_MONTH, AUTUMN_DAY)
  if (today < thisYear) return thisYear
  return new Date(today.getFullYear() + 1, AUTUMN_MONTH, AUTUMN_DAY)
}

/**
 * Turns a template's relative `dayOffset` into a concrete `date`, counted from
 * `start`. Templates store offsets rather than dates so they can never go
 * stale, and so item dates always agree with the trip's own start date.
 */
export function materializeTemplateDates<T extends { dayOffset: number }>(
  activities: T[],
  start: Date
): Array<Omit<T, "dayOffset"> & { date: string }> {
  return activities.map((activity) => {
    const { dayOffset, ...rest } = activity
    return { ...rest, date: toIsoDate(addDays(start, dayOffset)) }
  })
}
