export type Currency = "MNT" | "USD" | "JPY"

export type Rates = Record<string, number>

// Mirrors the seed row in supabase/migrations/0007_exchange_rates.sql — the
// value the UI renders with until (or in case) the cached DB row loads.
export const FALLBACK_RATES: Rates = { JPY: 1, USD: 0.0067, MNT: 22.3 }

// Replaces the three copy-pasted formatCost/formatCurrency implementations.
// Costs are always stored in JPY; `rates` comes from the exchange_rates row.
// Locale pinned to "en-US" so the thousands-separator formatting can't differ
// between the server's runtime locale and the browser's (hydration safety).
export function formatCurrency(amountJpy: number, currency: Currency, rates: Rates): string {
  const rate = rates[currency] ?? (currency === "JPY" ? 1 : null)
  if (rate == null) return `¥${amountJpy.toLocaleString("en-US")}` // safe fallback
  switch (currency) {
    case "MNT":
      return `₮ ${Math.round(amountJpy * rate).toLocaleString("en-US")}`
    case "USD":
      return `$ ${(amountJpy * rate).toFixed(2)}`
    default:
      return `¥${amountJpy.toLocaleString("en-US")}`
  }
}
