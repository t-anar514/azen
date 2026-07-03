import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { FlightDealRow } from "@/lib/supabase/types"
import { AIRPORT_NAMES } from "@/lib/transfers/airports"

/**
 * Flights module — single "swap point" for where flight-deal data comes from.
 *
 * Today this just reads the admin-curated `flight_deals` table (managed at
 * /admin/flights) — an admin pastes in a good fare + a link to wherever the
 * customer actually buys the ticket. When you're ready to pull live prices
 * from a real source (scraping a booking site, a flight-price API, etc.),
 * replace the body of this function with that logic — e.g. a scheduled job
 * that upserts rows into `flight_deals` — and every page that calls
 * getActiveFlightDeals() keeps working completely unchanged.
 */
export async function getActiveFlightDeals(): Promise<FlightDealRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("flight_deals")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true })

  return data ?? []
}

// Re-exported for existing importers — the canonical list now lives in
// src/lib/transfers/airports.ts (no "server-only", so it can also be used
// from the client-side booking form's airport select).
export { AIRPORT_NAMES }

export function airportLabel(code: string | null, cityFallback: string): string {
  if (code && AIRPORT_NAMES[code]) return AIRPORT_NAMES[code]
  return `${cityFallback} Airport`
}
