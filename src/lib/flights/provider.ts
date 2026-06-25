import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { FlightDealRow } from "@/lib/supabase/types"

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

// Maps a few common Japan airport IATA codes to a full pickup-location label,
// used to prefill the transfer booking form from a flight deal's destination.
const AIRPORT_NAMES: Record<string, string> = {
  NRT: "Narita International Airport (NRT)",
  HND: "Haneda Airport (HND)",
  KIX: "Kansai International Airport (KIX)",
  ITM: "Osaka Itami Airport (ITM)",
  NGO: "Chubu Centrair International Airport (NGO)",
  FUK: "Fukuoka Airport (FUK)",
  CTS: "New Chitose Airport (CTS)",
}

export function airportLabel(code: string | null, cityFallback: string): string {
  if (code && AIRPORT_NAMES[code]) return AIRPORT_NAMES[code]
  return `${cityFallback} Airport`
}
