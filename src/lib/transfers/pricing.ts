import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { PricingSource, TransferZoneRow } from "@/lib/supabase/types"

export interface PriceQuote {
  price: number
  currency: string
  distanceKm: number | null
  source: PricingSource
  zoneLabel: string | null
}

/**
 * Active destination zones for a given pickup airport, for populating the
 * dropoff select on the booking form. Ordered the same way an admin arranges
 * them in /admin/transfer-pricing.
 */
export async function getZonesForAirport(airportCode: string): Promise<TransferZoneRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("transfer_zones")
    .select("*")
    .eq("airport_code", airportCode)
    .eq("is_active", true)
    .order("order_index", { ascending: true })

  return data ?? []
}

// Prices are shown in whole units of the currency (MNT has no minor unit in
// practice here) — round to the nearest 500 so formula output doesn't come
// back as an oddly specific number like "43,270".
function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step
}

/**
 * Computes what a transfer should cost, in three tiers:
 *
 * 1. route_prices — an admin has curated an exact price for this
 *    (zone, vehicle) pair. Always wins when present.
 * 2. formula — the zone is known (so we have a distance estimate) but no
 *    curated override exists yet: base_fare + price_per_km * distance_km.
 * 3. vehicle_flat — no zone at all (a one-off address the guest typed in
 *    that isn't in the curated list yet). Falls back to the vehicle's flat
 *    starting price, same as the pre-0006 behavior.
 *
 * Never trust a price sent from the client — this is always the source of
 * truth, called server-side from /api/transfer/quote (for the live UI
 * preview) and again from /api/bookings (for the actual charge).
 */
export async function quoteTransferPrice({
  vehicleOptionId,
  zoneId,
}: {
  vehicleOptionId: string
  zoneId: string | null
}): Promise<PriceQuote | null> {
  const supabase = await createClient()

  const { data: vehicle } = await supabase
    .from("vehicle_options")
    .select("*")
    .eq("id", vehicleOptionId)
    .eq("is_active", true)
    .single()

  if (!vehicle) return null

  if (zoneId) {
    const { data: zone } = await supabase
      .from("transfer_zones")
      .select("*")
      .eq("id", zoneId)
      .eq("is_active", true)
      .single()

    if (zone) {
      const { data: routePrice } = await supabase
        .from("route_prices")
        .select("*")
        .eq("zone_id", zoneId)
        .eq("vehicle_option_id", vehicleOptionId)
        .eq("is_active", true)
        .maybeSingle()

      if (routePrice) {
        return {
          price: routePrice.price,
          currency: routePrice.currency,
          distanceKm: zone.distance_km,
          source: "route_table",
          zoneLabel: zone.label,
        }
      }

      const formulaPrice = vehicle.base_fare + vehicle.price_per_km * zone.distance_km
      return {
        price: roundToStep(formulaPrice, 500),
        currency: vehicle.currency,
        distanceKm: zone.distance_km,
        source: "formula",
        zoneLabel: zone.label,
      }
    }
  }

  // No zone_id, or the zone lookup missed (inactive/deleted) — unlisted
  // destination, fall back to the vehicle's flat starting price.
  return {
    price: vehicle.price,
    currency: vehicle.currency,
    distanceKm: null,
    source: "vehicle_flat",
    zoneLabel: null,
  }
}
