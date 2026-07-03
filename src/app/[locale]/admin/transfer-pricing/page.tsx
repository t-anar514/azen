import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TransferZoneRowActions } from "@/components/admin/TransferZoneRowActions"
import { AIRPORT_NAMES } from "@/lib/transfers/airports"
import type { TransferZoneRow, RoutePriceRow, VehicleOptionRow } from "@/lib/supabase/types"

async function getData() {
  const supabase = await createClient()
  const [{ data: zones }, { data: routePrices }, { data: vehicles }] = await Promise.all([
    supabase.from("transfer_zones").select("*").order("airport_code").order("order_index"),
    supabase.from("route_prices").select("*"),
    supabase.from("vehicle_options").select("*").order("order_index"),
  ])

  return {
    zones: (zones ?? []) as TransferZoneRow[],
    routePrices: (routePrices ?? []) as RoutePriceRow[],
    vehicles: (vehicles ?? []) as VehicleOptionRow[],
  }
}

function formatPrice(price: number, currency: string) {
  return `${new Intl.NumberFormat("mn-MN").format(price)} ${currency}`
}

export default async function AdminTransferPricingPage() {
  const { zones, routePrices, vehicles } = await getData()
  const activeVehicles = vehicles.filter((v) => v.is_active)

  const pricesByZone = new Map<string, RoutePriceRow[]>()
  for (const rp of routePrices) {
    pricesByZone.set(rp.zone_id, [...(pricesByZone.get(rp.zone_id) ?? []), rp])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tight">Transfer pricing</h1>
          <p className="text-muted-foreground">
            Destination zones per airport, with a curated price per vehicle where you&apos;ve set one.
            Anything left blank falls back to that vehicle&apos;s base fare + per-km rate × the zone&apos;s
            distance — edit those rates on the{" "}
            <Link href="/admin/transfers" className="underline">
              Transfers
            </Link>{" "}
            page&apos;s vehicle options, or directly in Supabase for now.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/transfer-pricing/new">+ New zone</Link>
        </Button>
      </div>

      {zones.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            No destination zones yet — every booking falls back to each vehicle&apos;s flat starting
            price until you add one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {zones.map((zone) => {
            const overrides = new Map(
              (pricesByZone.get(zone.id) ?? []).map((rp) => [rp.vehicle_option_id, rp])
            )

            return (
              <Card key={zone.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {AIRPORT_NAMES[zone.airport_code] ?? zone.airport_code} · {zone.distance_km} km
                      </p>
                      <p className="font-semibold">
                        {zone.label}{" "}
                        {!zone.is_active && (
                          <span className="text-xs font-normal text-muted-foreground">(inactive)</span>
                        )}
                      </p>
                    </div>
                    <TransferZoneRowActions id={zone.id} isActive={zone.is_active} />
                  </div>

                  <div className="grid gap-2 text-sm sm:grid-cols-3">
                    {activeVehicles.map((vehicle) => {
                      const override = overrides.get(vehicle.id)
                      const formulaPrice =
                        vehicle.base_fare + vehicle.price_per_km * zone.distance_km
                      return (
                        <div key={vehicle.id} className="rounded-md border border-border/40 px-3 py-2">
                          <p className="text-xs text-muted-foreground">{vehicle.name}</p>
                          {override ? (
                            <p className="font-semibold">{formatPrice(override.price, override.currency)}</p>
                          ) : (
                            <p className="font-semibold text-muted-foreground">
                              {formatPrice(Math.round(formulaPrice / 500) * 500, vehicle.currency)}{" "}
                              <span className="text-xs font-normal">(formula)</span>
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
