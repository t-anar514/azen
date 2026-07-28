/**
 * Pricing and option model for the staged guide-booking flow.
 *
 * `amount` on guide_bookings stays the *guide payout* (hours × hourly rate) —
 * the studio's earnings screens sum that column, so the platform fee must not
 * be folded into it. The service fee and traveler total are presentation-only,
 * derived here so the modal and any later checkout agree on one formula.
 */

export const SERVICE_FEE_RATE = 0.07

export interface DurationOption {
  hours: number
  label: string
}

export const DURATION_OPTIONS: DurationOption[] = [
  { hours: 3, label: "3 ц" },
  { hours: 5, label: "5 ц" },
  { hours: 8, label: "8 ц" },
  { hours: 10, label: "Бүтэн өдөр" },
]

export const INTEREST_OPTIONS = [
  "Foodie",
  "Nightlife",
  "Local Gems",
  "Drinking spot",
  "Japan culture",
]

export const START_TIME_OPTIONS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
]

export const NOTE_MAX_LENGTH = 400

export interface BookingQuote {
  /** hours × hourly rate — what the guide earns, stored as `amount`. */
  subtotal: number
  serviceFee: number
  total: number
}

export function quoteBooking(hourlyRate: number, hours: number): BookingQuote {
  const subtotal = Math.max(0, Math.round(hourlyRate * hours))
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
  return { subtotal, serviceFee, total: subtotal + serviceFee }
}

/** "09:00" + 5 → "14:00". Wraps past midnight rather than overflowing. */
export function addHours(start: string, hours: number): string {
  const [h, m] = start.split(":").map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return start
  const end = (h + hours) % 24
  return `${String(end).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/** ¥ amounts render without decimals throughout the product. */
export function yen(value: number): string {
  return `¥${value.toLocaleString("en-US")}`
}

/**
 * Short traveler-facing reference. Mirrors generateTripCode() in lib/bookings
 * (no 0/O/1/I) so the two booking products read consistently.
 */
export function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `AZ-${code}`
}
