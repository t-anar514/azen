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

// Prices are shown in whole units of the currency (JPY has no minor unit) —
// round to the nearest 500 so formula output doesn't come back as an oddly
// specific number like "12,024".
function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step
}

// A client-supplied routed distance (used only for one-off typed addresses that
// aren't a curated zone yet) is never fully trusted: clamp it to a sane airport-
// transfer range so a tampered request can't manufacture an absurd estimate. The
// resulting price is still an estimate the team confirms — see quoteTransferPrice.
function normalizeCustomDistance(value: number | null | undefined): number | null {
  if (value == null || typeof value !== "number" || !Number.isFinite(value)) return null
  if (value <= 0) return null
  const clamped = Math.min(Math.max(value, 1), 2000)
  return Math.round(clamped * 10) / 10
}

/**
 * Computes what a transfer should cost, in three tiers:
 *
 * 1. route_prices — an admin has curated an exact price for this
 *    (zone, vehicle) pair. Always wins when present.
 * 2. formula — the zone is known (so we have a distance estimate) but no
 *    curated override exists yet: base_fare + price_per_km * distance_km.
 * 3a. formula (custom) — no curated zone, but the booking form resolved a
 *     live driving distance for the address the guest typed. Price it on the
 *     same per-km formula so pricing stays distance-based everywhere; flagged
 *     as an estimate the team confirms (the booking keeps zone_id = null).
 * 3b. vehicle_flat — no zone and no distance at all. Falls back to the
 *     vehicle's flat starting price, same as the pre-0006 behavior.
 *
 * Never trust a price sent from the client — this is always the source of
 * truth, called server-side from /api/transfer/quote (for the live UI
 * preview) and again from /api/bookings (for the actual charge). `distanceKm`
 * is only consulted when no zone matches, and is clamped before use.
 */
export async function quoteTransferPrice({
  vehicleOptionId,
  zoneId,
  distanceKm,
}: {
  vehicleOptionId: string
  zoneId: string | null
  distanceKm?: number | null
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

  // No curated zone. If the form resolved a live driving distance for the
  // typed address, price it on the same per-km formula so the estimate is
  // genuinely distance-based; otherwise fall back to the flat starting price.
  const customDistance = normalizeCustomDistance(distanceKm)
  if (customDistance != null) {
    const formulaPrice = vehicle.base_fare + vehicle.price_per_km * customDistance
    return {
      price: roundToStep(formulaPrice, 500),
      currency: vehicle.currency,
      distanceKm: customDistance,
      source: "formula",
      zoneLabel: null,
    }
  }

  return {
    price: vehicle.price,
    currency: vehicle.currency,
    distanceKm: null,
    source: "vehicle_flat",
    zoneLabel: null,
  }
}
