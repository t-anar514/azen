// Mongolian date formatting + a tiny "which city is this?" lookup for the
// /planner redesign (design doc Screen 03). Hand-rolled instead of
// toLocaleDateString("mn-MN") so server and browser can never disagree on the
// output (same hydration-safety reasoning as src/lib/currency/format.ts).
//
// All dates are the planner's plain "YYYY-MM-DD" strings; parse them as UTC so
// the rendered day never shifts across timezones (TimelineItem already renders
// with timeZone: "UTC" for the same reason).

const MN_WEEKDAYS = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"]

export function parseISODate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value ?? "")) return null
  const d = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "2026-11-12" → "11-р сарын 12, Мягмар" (weekday computed, not trusted). */
export function formatMnDay(value: string): string {
  const d = parseISODate(value)
  if (!d) return value
  return `${d.getUTCMonth() + 1}-р сарын ${d.getUTCDate()}, ${MN_WEEKDAYS[d.getUTCDay()]}`
}

/**
 * "2026-07-21" → "7-р сарын 21" (no weekday) for bylines and summary rows.
 * Accepts a full timestamptz too — only the leading date part is read.
 */
export function formatMnMonthDay(value: string): string {
  const d = parseISODate(value)
  if (!d) return value
  return `${d.getUTCMonth() + 1}-р сарын ${d.getUTCDate()}`
}

/** "2026-11-12" → "11/12" for the compact date chip on timeline cards. */
export function formatMnShort(value: string): string {
  const d = parseISODate(value)
  if (!d) return value
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
}

/**
 * Trip header subtitle: "11-р сарын 12 – 25 · 14 хоног" (same-month) or
 * "11-р сарын 28 – 12-р сарын 5 · 8 хоног" (cross-month). Falls back to ""
 * when either date is missing/invalid.
 */
export function formatMnRange(start: string, end: string): string {
  const s = parseISODate(start)
  const e = parseISODate(end)
  if (!s || !e) return ""

  const sPart = `${s.getUTCMonth() + 1}-р сарын ${s.getUTCDate()}`
  const ePart =
    s.getUTCMonth() === e.getUTCMonth() && s.getUTCFullYear() === e.getUTCFullYear()
      ? `${e.getUTCDate()}`
      : `${e.getUTCMonth() + 1}-р сарын ${e.getUTCDate()}`

  const days = Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1
  if (days < 1) return sPart

  return `${sPart} – ${ePart} · ${days} хоног`
}

// ── nearest-city lookup ──────────────────────────────────────────────────────
// Major Japanese cities with Mongolian names, for the day-group tag and the
// map's floating "Токио · 2 өдөр" chip. Deliberately coarse: Narita airport
// (60 km out) should still read "Токио", so no airport towns in the list and
// a generous default radius.

const CITIES: { name: string; lat: number; lng: number }[] = [
  { name: "Токио", lat: 35.6895, lng: 139.6917 },
  { name: "Иокохама", lat: 35.4437, lng: 139.638 },
  { name: "Киото", lat: 35.0116, lng: 135.7681 },
  { name: "Осака", lat: 34.6937, lng: 135.5023 },
  { name: "Нара", lat: 34.6851, lng: 135.8048 },
  { name: "Кобе", lat: 34.6901, lng: 135.1955 },
  { name: "Нагоя", lat: 35.1815, lng: 136.9066 },
  { name: "Хаконэ", lat: 35.2324, lng: 139.1069 },
  { name: "Хиросима", lat: 34.3853, lng: 132.4553 },
  { name: "Фукуока", lat: 33.5904, lng: 130.4017 },
  { name: "Саппоро", lat: 43.0618, lng: 141.3545 },
  { name: "Каназава", lat: 36.5613, lng: 136.6562 },
  { name: "Сэндай", lat: 38.2682, lng: 140.8694 },
  { name: "Окинава", lat: 26.2124, lng: 127.6809 },
]

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/** Closest known city within maxKm, or null (labels are hidden when unknown). */
export function nearestCityName(lat: number, lng: number, maxKm = 100): string | null {
  let best: string | null = null
  let bestDist = maxKm
  for (const city of CITIES) {
    const dist = haversineKm(lat, lng, city.lat, city.lng)
    if (dist <= bestDist) {
      best = city.name
      bestDist = dist
    }
  }
  return best
}
