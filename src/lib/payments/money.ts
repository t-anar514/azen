/**
 * Money for Wire payments.
 *
 * Prices are stored in JPY (`guides.price`); Wire charges MNT. Every step that
 * turns one into the other lives here, so the arithmetic is testable on its own
 * and has exactly one home.
 */

/**
 * How many integer units Wire expects per tögrög.
 *
 * Wire's documentation contradicts itself. The quickstart and "Money and time"
 * say amounts are integer *minor units* (`50000` = 500.00 ₮, "divide by 100 in
 * your presentation layer"); the payment-links page says "Amounts are whole
 * tögrög (MNT has no minor unit)".
 *
 * Both cannot be true, and the gap is a factor of 100 on every single charge.
 * The tögrög has no circulating subunit and the minor-unit wording reads like
 * it was inherited from Stripe's docs, so this is 1 — but it is deliberately
 * one named constant, so a sandbox charge proving otherwise is a one-line fix
 * instead of a hunt through the codebase.
 */
export const MNT_UNITS_PER_TOGROG = 1

function assertFinite(n: number, label: string): void {
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`${label} must be a finite number, got ${String(n)}`)
  }
}

/**
 * Whether a rate is safe to charge against.
 *
 * Exists mainly to catch a missing or zero rate: `exchange_rates` is a cached
 * snapshot, and a 0 slipping through would bill a real booking as 0 ₮ without
 * anything looking obviously wrong.
 */
export function isUsableRate(rate: unknown): rate is number {
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0
}

/**
 * JPY → whole tögrög at `rate`, rounded to the nearest tögrög.
 *
 * The rate is a parameter rather than something read in here: it gets locked
 * onto the booking row at creation time, so the caller fetches it once and
 * records the exact value it used.
 */
export function jpyToTogrog(amountJpy: number, rate: number): number {
  assertFinite(amountJpy, "amount")
  assertFinite(rate, "rate")
  if (amountJpy <= 0) throw new Error(`amount must be positive, got ${amountJpy}`)
  if (rate <= 0) throw new Error(`rate must be positive, got ${rate}`)
  return Math.round(amountJpy * rate)
}

/** Whole tögrög → the integer sent to Wire. */
export function toWireAmount(togrog: number): number {
  assertFinite(togrog, "amount")
  if (togrog <= 0) throw new Error(`amount must be positive, got ${togrog}`)
  if (!Number.isInteger(togrog)) {
    throw new Error(`amount must be an integer number of tögrög, got ${togrog}`)
  }
  const wire = togrog * MNT_UNITS_PER_TOGROG
  if (!Number.isSafeInteger(wire)) {
    throw new Error(`amount ${wire} is outside the safe integer range`)
  }
  return wire
}
