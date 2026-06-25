import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const { data, error } = await supabase
    .from("flight_deals")
    .select("*")
    .order("order_index", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase, user } = guard

  const body = await request.json().catch(() => null)
  if (!body?.origin_city || !body?.price || !body?.deal_url) {
    return NextResponse.json({ error: "origin_city, price, and deal_url are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("flight_deals")
    .insert({
      origin_city: body.origin_city,
      origin_code: body.origin_code ?? null,
      destination_city: body.destination_city ?? "Tokyo",
      destination_code: body.destination_code ?? null,
      airline: body.airline ?? null,
      price: body.price,
      currency: body.currency ?? "MNT",
      depart_date: body.depart_date ?? null,
      return_date: body.return_date ?? null,
      deal_url: body.deal_url,
      source: body.source ?? null,
      is_active: body.is_active ?? true,
      order_index: body.order_index ?? 0,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
