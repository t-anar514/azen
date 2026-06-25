import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const body = await request.json().catch(() => null)
  if (!body?.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("guides")
    .insert({
      legacy_id: body.legacy_id ?? null,
      profile_id: body.profile_id ?? null,
      name: body.name,
      location: body.location ?? null,
      tags: body.tags ?? [],
      rating: body.rating ?? 5.0,
      review_count: body.review_count ?? 0,
      price: body.price ?? null,
      bio: body.bio ?? null,
      is_verified: body.is_verified ?? false,
      is_active: body.is_active ?? true,
      image: body.image ?? null,
      image_public_id: body.image_public_id ?? null,
      video_url: body.video_url ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
