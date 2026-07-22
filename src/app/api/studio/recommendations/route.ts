import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { guideSlug } from "@/lib/guides/slug"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })
  const { data: guide } = await supabase
    .from("guides").select("id").eq("profile_id", user.id).single()
  if (!guide) return NextResponse.json({ error: "not a guide" }, { status: 403 })

  const b = await req.json().catch(() => ({}))
  if (!b.name || !b.cityId || !b.category || !b.quote)
    return NextResponse.json({ error: "invalid" }, { status: 400 })

  const slug = guideSlug(b.name)
  const id = `${b.cityId}-${slug}`
  const { error: pErr } = await supabase.from("places").insert({
    id, city_id: b.cityId, slug, name: b.name, category: b.category,
    neighborhood: b.neighborhood ?? null, price_band: b.priceBand ?? null,
    cover_image: b.coverImage ?? null, gallery: b.gallery ?? [],
    short_desc: b.quote?.slice(0, 240) ?? null, tags: b.tags ?? [],
    is_hidden_gem: !!b.isHiddenGem, published: !!b.published,
    created_by_guide_id: guide.id,
  })
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 400 })

  const { error: rErr } = await supabase.from("place_recommendations")
    .insert({ place_id: id, guide_id: guide.id, quote: b.quote })
  if (rErr) {
    // roll back the just-created places row so a retry doesn't collide on the PK
    await supabase.from("places").delete().eq("id", id)
    return NextResponse.json({ error: rErr.message }, { status: 400 })
  }
  return NextResponse.json({ id })
}

// PATCH { id, ...fields } — edits a guide's own recommendation. The field
// whitelist mirrors the POST body's camelCase naming; `cityId`/`category`
// are intentionally excluded since the place `id` is derived from them at
// creation time. `quote` lives on the paired place_recommendations row, so
// it's applied there rather than on `places`. Both updates rely on RLS
// (`places_guide_manage_own`, `recs_guide_manage_own`) for ownership — no
// redundant app-level guide_id check, matching the guide_bookings PATCH
// convention above.
const FIELD_MAP: Record<string, string> = {
  name: "name",
  neighborhood: "neighborhood",
  priceBand: "price_band",
  coverImage: "cover_image",
  gallery: "gallery",
  tags: "tags",
  isHiddenGem: "is_hidden_gem",
  published: "published",
  shortDesc: "short_desc",
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })
  const { data: guide } = await supabase
    .from("guides").select("id").eq("profile_id", user.id).single()
  if (!guide) return NextResponse.json({ error: "not a guide" }, { status: 403 })

  const b = await req.json().catch(() => ({}))
  if (!b.id) return NextResponse.json({ error: "invalid" }, { status: 400 })

  const placeUpdate: Record<string, unknown> = {}
  for (const [key, column] of Object.entries(FIELD_MAP)) {
    if (key in b) placeUpdate[column] = b[key]
  }

  if (Object.keys(placeUpdate).length) {
    const { data, error } = await supabase.from("places")
      .update(placeUpdate).eq("id", b.id).select("id")
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data?.length) return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  if ("quote" in b) {
    const { error } = await supabase.from("place_recommendations")
      .update({ quote: b.quote }).eq("place_id", b.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
