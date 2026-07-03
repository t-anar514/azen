import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const [{ data: zone, error: zoneError }, { data: routePrices, error: pricesError }] = await Promise.all([
    supabase.from("transfer_zones").select("*").eq("id", id).single(),
    supabase.from("route_prices").select("*").eq("zone_id", id),
  ])

  if (zoneError) return NextResponse.json({ error: zoneError.message }, { status: 404 })
  if (pricesError) return NextResponse.json({ error: pricesError.message }, { status: 500 })

  return NextResponse.json({ data: { zone, routePrices: routePrices ?? [] } })
}

// body: { airport_code?, label?, distance_km?, is_active?, order_index?,
//         prices?: { [vehicle_option_id]: number | null } }
// Same `prices` semantics as POST — a null entry deletes any existing
// override for that vehicle (reverting it to the formula fallback).
export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const allowed = ["airport_code", "label", "distance_km", "is_active", "order_index"] as const
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from("transfer_zones").update(update).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (body.prices && typeof body.prices === "object") {
    const prices = body.prices as Record<string, number | null>

    for (const [vehicleOptionId, price] of Object.entries(prices)) {
      if (price == null) {
        const { error } = await supabase
          .from("route_prices")
          .delete()
          .eq("zone_id", id)
          .eq("vehicle_option_id", vehicleOptionId)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      } else {
        const { error } = await supabase
          .from("route_prices")
          .upsert(
            { zone_id: id, vehicle_option_id: vehicleOptionId, price },
            { onConflict: "zone_id,vehicle_option_id" }
          )
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }
  }

  const { data, error } = await supabase.from("transfer_zones").select("*").eq("id", id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  // route_prices rows cascade-delete with the zone (FK on delete cascade in
  // 0006_transfer_route_pricing.sql).
  const { error } = await supabase.from("transfer_zones").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
