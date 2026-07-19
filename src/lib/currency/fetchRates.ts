import "server-only"

// Free, keyless, no-rate-limit FX source (daily-updated static JSON on
// jsDelivr's CDN). Chosen over Frankfurter because it supports MNT.
// https://github.com/fawazahmed0/exchange-api
const PRIMARY =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/jpy.json"
const FALLBACK = "https://latest.currency-api.pages.dev/v1/currencies/jpy.json"

export async function fetchLatestJpyRates(): Promise<Record<string, number>> {
  for (const url of [PRIMARY, FALLBACK]) {
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) continue
      const data = await res.json()
      const jpy = data.jpy
      if (typeof jpy?.usd !== "number" || typeof jpy?.mnt !== "number") continue
      return { JPY: 1, USD: jpy.usd, MNT: jpy.mnt }
    } catch {
      continue // try the fallback host
    }
  }
  throw new Error("Both FX sources failed")
}
