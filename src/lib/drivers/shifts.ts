/**
 * Shift model for driver scheduling (migration 0025).
 *
 * Allowlist, not blocklist: a driver is bookable only where a `driver_shifts`
 * row exists. That is the opposite of `@/lib/guides/availability`, and
 * deliberately so — a guide is nominally free every day and marks the
 * exceptions, whereas a driver's week is mostly closed and they open the parts
 * they want to work.
 *
 * Everything here is pure so the studio editor, the admin coverage table and
 * the traveler's calendar all derive their state from the same rules instead of
 * each re-implementing "is this slot open".
 */

export type ShiftSlot = "morning" | "day" | "evening"

export interface SlotMeta {
  id: ShiftSlot
  /** "Өглөө" */
  label: string
  /** Inclusive start hour, local. */
  startHour: number
  /** Exclusive end hour, local. */
  endHour: number
  /** "06:00–12:00" */
  range: string
  /** "06–12" — the compact form the weekly grid header uses. */
  shortRange: string
}

/** Ordered, and the order is load-bearing: every grid renders left-to-right in it. */
export const SHIFT_SLOTS: readonly SlotMeta[] = [
  { id: "morning", label: "Өглөө", startHour: 6, endHour: 12, range: "06:00–12:00", shortRange: "06–12" },
  { id: "day", label: "Өдөр", startHour: 12, endHour: 18, range: "12:00–18:00", shortRange: "12–18" },
  { id: "evening", label: "Орой", startHour: 18, endHour: 24, range: "18:00–24:00", shortRange: "18–24" },
] as const

export const SLOT_IDS: readonly ShiftSlot[] = SHIFT_SLOTS.map((s) => s.id)

export function slotMeta(slot: ShiftSlot): SlotMeta {
  // Non-null: ShiftSlot is closed over SHIFT_SLOTS by construction.
  return SHIFT_SLOTS.find((s) => s.id === slot)!
}

export function isShiftSlot(v: unknown): v is ShiftSlot {
  return typeof v === "string" && SLOT_IDS.includes(v as ShiftSlot)
}

/**
 * ISO weekday numbering — 1 = Monday … 7 = Sunday — matching
 * `extract(isodow)` in 0025 so the template grid and the SQL that stamps it
 * forward agree without a conversion step in between.
 */
export const WEEKDAYS: readonly { iso: number; short: string; long: string }[] = [
  { iso: 1, short: "Да", long: "Даваа" },
  { iso: 2, short: "Мя", long: "Мягмар" },
  { iso: 3, short: "Лх", long: "Лхагва" },
  { iso: 4, short: "Пү", long: "Пүрэв" },
  { iso: 5, short: "Ба", long: "Баасан" },
  { iso: 6, short: "Бя", long: "Бямба" },
  { iso: 7, short: "Ня", long: "Ням" },
] as const

export const MONTH_LABEL = (month: number) => `${month}-р сар`

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

export function isValidDateKey(v: unknown): v is string {
  return typeof v === "string" && DATE_KEY.test(v)
}

/**
 * Local "YYYY-MM-DD". Same reasoning as `toDateKey` in the guide module:
 * `toISOString().slice(0,10)` converts to UTC first, which shifts the date by a
 * day for anyone east of Greenwich — including every user of this product.
 */
export function toDateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

/** Parses a date key as *local* midnight, for the same reason. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, days: number): string {
  const d = fromDateKey(key)
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}

/** ISO weekday (1–7) for a date key. JS getDay() is 0=Sunday, hence the wrap. */
export function isoWeekday(key: string): number {
  const day = fromDateKey(key).getDay()
  return day === 0 ? 7 : day
}

/** The Monday on or before `key` — every grid in the design starts weeks on Да. */
export function startOfWeek(key: string): string {
  return addDays(key, -(isoWeekday(key) - 1))
}

/** Which slot a pickup time falls in. 00:00–06:00 has no slot by design. */
export function slotForHour(hour: number): ShiftSlot | null {
  const match = SHIFT_SLOTS.find((s) => hour >= s.startHour && hour < s.endHour)
  return match?.id ?? null
}

/** Same, from a `datetime-local` value or an ISO timestamp. */
export function slotForDatetime(value: string): ShiftSlot | null {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : slotForHour(d.getHours())
}

// ── weekly template ─────────────────────────────────────────────────────────

/** One open cell of the weekly stencil. */
export interface TemplateCell {
  weekday: number
  slot: ShiftSlot
  capacity: number
}

export function templateKey(weekday: number, slot: ShiftSlot): string {
  return `${weekday}:${slot}`
}

export function templateSet(cells: Pick<TemplateCell, "weekday" | "slot">[]): Set<string> {
  return new Set(cells.map((c) => templateKey(c.weekday, c.slot)))
}

/**
 * Mirrors `open_driver_shifts()` in 0025: stamp the template across `weeks`
 * weeks starting the day after `today`.
 *
 * This exists so the button can say "you are about to open 11 shifts through
 * 8-р сарын 24" before the driver commits, and so that promise is computed from
 * the same rule the database will apply rather than a guess. It is the client's
 * preview; the RPC remains authoritative.
 */
export function previewOpenWeeks(
  cells: Pick<TemplateCell, "weekday" | "slot">[],
  today: string,
  weeks: number
): { dates: string[]; slots: number; through: string } {
  const open = templateSet(cells)
  const start = addDays(today, 1)
  const days = weeks * 7
  const dates: string[] = []
  let slots = 0

  for (let i = 0; i < days; i++) {
    const date = addDays(start, i)
    const weekday = isoWeekday(date)
    const hits = SLOT_IDS.filter((slot) => open.has(templateKey(weekday, slot)))
    if (hits.length > 0) {
      dates.push(date)
      slots += hits.length
    }
  }

  return { dates, slots, through: addDays(start, days - 1) }
}

// ── per-day state ───────────────────────────────────────────────────────────

export interface ShiftRow {
  date: string
  slot: ShiftSlot
  capacity: number
  booked_count: number
}

/**
 * `closed` — no row; `booked` — sold, and therefore not closable (the DELETE
 * policy in 0025 refuses it, so the UI must not offer it either); `open` — row
 * exists with room left.
 */
export type SlotState = "closed" | "open" | "booked"

export function resolveSlotState(row: ShiftRow | undefined): SlotState {
  if (!row) return "closed"
  return row.booked_count > 0 ? "booked" : "open"
}

export function indexShifts(rows: ShiftRow[]): Map<string, ShiftRow> {
  return new Map(rows.map((r) => [`${r.date}:${r.slot}`, r]))
}

/** How many of a driver's next `days` days have at least one open slot. */
export function openDayCount(rows: ShiftRow[], from: string, days: number): number {
  const to = addDays(from, days - 1)
  const dates = new Set(rows.filter((r) => r.date >= from && r.date <= to).map((r) => r.date))
  return dates.size
}

/**
 * Seven booleans for the sparkline in the admin table's "Хуваарь · 7 хоног"
 * column: null = closed, "open" or "booked" otherwise.
 */
export function weekStrip(rows: ShiftRow[], from: string): (SlotState | null)[] {
  const byDate = new Map<string, ShiftRow[]>()
  for (const r of rows) {
    const list = byDate.get(r.date)
    if (list) list.push(r)
    else byDate.set(r.date, [r])
  }
  return Array.from({ length: 7 }, (_, i) => {
    const day = byDate.get(addDays(from, i))
    if (!day || day.length === 0) return null
    return day.some((r) => r.booked_count > 0) ? "booked" : "open"
  })
}

// ── admin-facing driver status ──────────────────────────────────────────────

/**
 * What /admin/drivers shows in the status pill.
 *
 * The database only knows pending/approved/rejected. Those three cannot answer
 * the question the admin screen exists to answer — "is this person actually
 * contributing capacity?" — because an approved driver who has never opened a
 * shift is worth exactly as much as one who was never approved. The three
 * schedule-derived states below are the difference, and each has its own row
 * action: nudge, nudge, or nothing.
 */
export type DriverStatus =
  | "pending"     // Хүлээгдэж буй — application awaiting review
  | "active"      // Идэвхтэй — approved, schedule open comfortably ahead
  | "expiring"    // Дуусах дөхсөн — runs out within EXPIRY_WARNING_DAYS
  | "lapsed"      // Хуваарь дууссан — horizon is in the past
  | "unscheduled" // Хуваарьгүй — approved but never opened a single shift
  | "suspended"   // Түдгэлзүүлсэн — rejected or revoked

/** A schedule ending inside this many days is worth chasing. */
export const EXPIRY_WARNING_DAYS = 7

export function driverStatus(
  driver: { verification_status: string; schedule_open_until: string | null },
  today: string
): DriverStatus {
  if (driver.verification_status === "pending") return "pending"
  if (driver.verification_status !== "approved") return "suspended"

  const until = driver.schedule_open_until
  if (!until) return "unscheduled"
  if (until < today) return "lapsed"
  // Date keys are fixed-width, so string comparison is chronological.
  if (until <= addDays(today, EXPIRY_WARNING_DAYS)) return "expiring"
  return "active"
}

export const DRIVER_STATUS_LABEL: Record<DriverStatus, string> = {
  pending: "Хүлээгдэж буй",
  active: "Идэвхтэй",
  expiring: "Дуусах дөхсөн",
  lapsed: "Хуваарь дууссан",
  unscheduled: "Хуваарьгүй",
  suspended: "Түдгэлзүүлсэн",
}

/** Which of the four table tabs a driver belongs under. */
export function statusTab(status: DriverStatus): "pending" | "active" | "suspended" {
  if (status === "pending") return "pending"
  if (status === "suspended") return "suspended"
  return "active"
}

// ── traveler-facing capacity ────────────────────────────────────────────────

/** One row of `driver_slot_availability()` — totals only, never a driver id. */
export interface SlotAvailability {
  date: string
  slot: ShiftSlot
  vehicles_open: number
  vehicles_left: number
}

export type CapacityBand = "none" | "full" | "scarce" | "plenty"

/** Below this the calendar switches to the saffron "цөөхөн үлдсэн" treatment. */
export const SCARCE_THRESHOLD = 3

export function capacityBand(vehiclesLeft: number, vehiclesOpen: number): CapacityBand {
  if (vehiclesOpen <= 0) return "none"
  if (vehiclesLeft <= 0) return "full"
  return vehiclesLeft < SCARCE_THRESHOLD ? "scarce" : "plenty"
}

export interface DayCapacity {
  date: string
  vehiclesOpen: number
  vehiclesLeft: number
  band: CapacityBand
  bySlot: Record<ShiftSlot, { open: number; left: number; band: CapacityBand }>
}

/**
 * Collapses per-slot availability into the per-day numbers the month grid
 * shows ("6 машин"), keeping the slot breakdown for the panel underneath.
 *
 * A date with rows but nothing left reports `full`, not `none` — the calendar
 * renders "Дүүрэн" differently from a day nobody opened, and conflating them
 * would tell a traveler to give up on a day that just needs a different slot.
 */
export function summariseDays(rows: SlotAvailability[]): Map<string, DayCapacity> {
  const out = new Map<string, DayCapacity>()

  for (const row of rows) {
    let day = out.get(row.date)
    if (!day) {
      day = {
        date: row.date,
        vehiclesOpen: 0,
        vehiclesLeft: 0,
        band: "none",
        bySlot: {
          morning: { open: 0, left: 0, band: "none" },
          day: { open: 0, left: 0, band: "none" },
          evening: { open: 0, left: 0, band: "none" },
        },
      }
      out.set(row.date, day)
    }
    day.vehiclesOpen += row.vehicles_open
    day.vehiclesLeft += row.vehicles_left
    day.bySlot[row.slot] = {
      open: row.vehicles_open,
      left: row.vehicles_left,
      band: capacityBand(row.vehicles_left, row.vehicles_open),
    }
  }

  for (const day of out.values()) {
    day.band = capacityBand(day.vehiclesLeft, day.vehiclesOpen)
  }
  return out
}

/** Platform default for "Хамгийн эрт захиалга", overridable per driver. */
export const DEFAULT_MIN_NOTICE_HOURS = 2

/**
 * Whether a traveler may still *offer* to book `slot` on `date`.
 *
 * Measured against the end of the window, not the start. A slot is a six-hour
 * range and the pickup lands wherever the flight does, so at 05:00 the
 * 06:00–12:00 window still has bookable hours in it even under a two-hour
 * minimum — closing it would hide capacity that exists.
 *
 * That makes this the permissive gate the calendar draws with. The strict check
 * is `isPickupBookable` below, which runs once an actual pickup time is known.
 */
export function isSlotBookable(
  capacity: { left: number; open: number } | undefined,
  opts: { date: string; slot: ShiftSlot; now?: Date; minNoticeHours?: number }
): boolean {
  if (!capacity || capacity.open <= 0 || capacity.left <= 0) return false

  const now = opts.now ?? new Date()
  const notice = opts.minNoticeHours ?? DEFAULT_MIN_NOTICE_HOURS
  const slotEnd = fromDateKey(opts.date)
  slotEnd.setHours(slotMeta(opts.slot).endHour, 0, 0, 0)

  return slotEnd.getTime() - now.getTime() > notice * 3_600_000
}

/** The strict rule, applied to a concrete pickup time before taking money. */
export function isPickupBookable(
  pickupIso: string,
  opts: { now?: Date; minNoticeHours?: number } = {}
): boolean {
  const pickup = new Date(pickupIso).getTime()
  if (!Number.isFinite(pickup)) return false
  const now = (opts.now ?? new Date()).getTime()
  const notice = opts.minNoticeHours ?? DEFAULT_MIN_NOTICE_HOURS
  return pickup - now >= notice * 3_600_000
}

/**
 * When the assigned driver's details unlock. Stored server-side as
 * `bookings.driver_visible_at` (0025); this recomputes it for display and for
 * the countdown, and is the fallback for rows written before that column
 * existed.
 */
export function driverRevealAt(pickupIso: string, minNoticeHours = DEFAULT_MIN_NOTICE_HOURS): Date {
  return new Date(new Date(pickupIso).getTime() - minNoticeHours * 3_600_000)
}

export function isDriverRevealed(
  booking: { driver_visible_at?: string | null; pickup_datetime: string },
  now: Date = new Date()
): boolean {
  const at = booking.driver_visible_at
    ? new Date(booking.driver_visible_at)
    : driverRevealAt(booking.pickup_datetime)
  return now.getTime() >= at.getTime()
}
