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

  const { data, error } = await supabase.from("places").select("*").eq("id", id).single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const allowed = [
    "city_id",
    "slug",
    "name",
    "category",
    "subcategory",
    "neighborhood",
    "lat",
    "lng",
    "address",
    "cover_image",
    "gallery",
    "short_desc",
    "long_desc",
    "price_band",
    "hours",
    "booking_url",
    "google_place_id",
    "tags",
    "is_hidden_gem",
    "published",
    "order_index",
  ] as const

  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }
  update.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("places")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const { error } = await supabase.from("places").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
