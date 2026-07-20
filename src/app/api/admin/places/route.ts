import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"
import { slugify } from "@/lib/slugify"

export async function GET(request: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const city = new URL(request.url).searchParams.get("city")

  let query = supabase
    .from("places")
    .select("*")
    .order("city_id", { ascending: true })
    .order("order_index", { ascending: true })
  if (city) query = query.eq("city_id", city)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const body = await request.json().catch(() => null)
  if (!body?.city_id || !body?.name || !body?.category) {
    return NextResponse.json(
      { error: "city_id, name and category are required" },
      { status: 400 }
    )
  }

  const slug = body.slug ? slugify(body.slug) : slugify(body.name)

  const { data, error } = await supabase
    .from("places")
    .insert({
      id: body.id ?? `${body.city_id}-${slug}`,
      city_id: body.city_id,
      slug,
      name: body.name,
      category: body.category,
      subcategory: body.subcategory ?? null,
      neighborhood: body.neighborhood ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      address: body.address ?? null,
      cover_image: body.cover_image ?? null,
      gallery: body.gallery ?? [],
      short_desc: body.short_desc ?? null,
      long_desc: body.long_desc ?? null,
      price_band: body.price_band ?? null,
      hours: body.hours ?? {},
      booking_url: body.booking_url ?? null,
      google_place_id: body.google_place_id ?? null,
      tags: body.tags ?? [],
      is_hidden_gem: body.is_hidden_gem ?? false,
      published: body.published ?? true,
      order_index: body.order_index ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
