// Formats a transfer price for display. Transfer money is stored in JPY
// (0017_transfer_jpy_pricing.sql) but the currency is carried on each row, so
// this stays currency-aware for any legacy MNT/USD data. Locale pinned to
// "en-US" so the thousands separator can't differ between the server render and
// the browser (hydration safety) — same reasoning as src/lib/currency/format.ts.
// Plain data helper (no "server-only") so client and server components share it.
export function formatTransferPrice(price: number, currency: string): string {
  const n = Math.round(price).toLocaleString("en-US")
  switch (currency) {
    case "JPY":
      return `¥${n}`
    case "USD":
      return `$${n}`
    case "MNT":
      return `₮${n}`
    default:
      return `${n} ${currency}`
  }
}

/**
 * Average door-to-door speed used to turn a stored `distance_km` into the
 * rough journey time shown on the tracking page. Airport transfers are mostly
 * expressway with city traffic at one end; 55 km/h is a deliberately
 * conservative blend. Always rendered with a "~" — it is an estimate, not a
 * routed ETA, because bookings carry distance but no duration.
 */
const AVG_TRANSFER_SPEED_KMH = 55

/** 78 → "~1ц 25мин". Returns null when the booking has no distance. */
export function estimateTransferDuration(distanceKm: number | null): string | null {
  if (!distanceKm || distanceKm <= 0) return null
  const minutes = Math.round((distanceKm / AVG_TRANSFER_SPEED_KMH) * 60)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `~${m}мин`
  if (m === 0) return `~${h}ц`
  return `~${h}ц ${m}мин`
}

/** 78.4 → "78 км" */
export function formatDistance(distanceKm: number | null): string | null {
  if (!distanceKm || distanceKm <= 0) return null
  return `${Math.round(distanceKm)} км`
}
