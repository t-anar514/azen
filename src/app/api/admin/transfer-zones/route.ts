import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const [{ data: zones, error: zonesError }, { data: routePrices, error: pricesError }] = await Promise.all([
    supabase.from("transfer_zones").select("*").order("airport_code").order("order_index"),
    supabase.from("route_prices").select("*"),
  ])

  if (zonesError) return NextResponse.json({ error: zonesError.message }, { status: 500 })
  if (pricesError) return NextResponse.json({ error: pricesError.message }, { status: 500 })

  return NextResponse.json({ data: { zones: zones ?? [], routePrices: routePrices ?? [] } })
}

// body: { airport_code, label, distance_km, is_active?, order_index?,
//         prices: { [vehicle_option_id]: number | null } }
// `prices` entries with a non-null value become curated route_prices rows;
// omitted/null entries leave that vehicle on the formula fallback.
export async function POST(request: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const body = await request.json().catch(() => null)
  if (!body?.airport_code || !body?.label || body?.distance_km == null) {
    return NextResponse.json({ error: "airport_code, label, and distance_km are required" }, { status: 400 })
  }

  const { data: zone, error: zoneError } = await supabase
    .from("transfer_zones")
    .insert({
      airport_code: body.airport_code,
      label: body.label,
      distance_km: body.distance_km,
      is_active: body.is_active ?? true,
      order_index: body.order_index ?? 0,
    })
    .select()
    .single()

  if (zoneError) return NextResponse.json({ error: zoneError.message }, { status: 500 })

  const prices = (body.prices ?? {}) as Record<string, number | null>
  const rows = Object.entries(prices)
    .filter(([, price]) => price != null)
    .map(([vehicleOptionId, price]) => ({
      zone_id: zone.id,
      vehicle_option_id: vehicleOptionId,
      price,
    }))

  if (rows.length > 0) {
    const { error: pricesError } = await supabase.from("route_prices").insert(rows)
    if (pricesError) return NextResponse.json({ error: pricesError.message }, { status: 500 })
  }

  return NextResponse.json({ data: zone }, { status: 201 })
}
