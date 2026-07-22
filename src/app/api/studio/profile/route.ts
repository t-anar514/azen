import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Whitelisted, camelCase-in/snake_case-out — defense-in-depth on top of the
// DB guard trigger (guard_guide_columns in 0020_guide_studio.sql), which
// already strips is_verified/rating/review_count/is_active/profile_id/
// legacy_id from any update to `guides`. Those columns simply never appear
// in FIELD_MAP, so they can never reach the update payload from this route.
const FIELD_MAP: Record<string, string> = {
  bio: "bio",
  coverImage: "cover_image",
  image: "image",
  imagePublicId: "image_public_id",
  tags: "tags",
  location: "location",
  price: "price",
  videoUrl: "video_url",
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })
  const { data: guide } = await supabase
    .from("guides").select("id").eq("profile_id", user.id).single()
  if (!guide) return NextResponse.json({ error: "not a guide" }, { status: 403 })

  const b = await req.json().catch(() => ({}))
  const update: Record<string, unknown> = {}
  for (const [key, column] of Object.entries(FIELD_MAP)) {
    if (key in b) update[column] = b[key]
  }
  if (!Object.keys(update).length)
    return NextResponse.json({ error: "invalid" }, { status: 400 })

  // RLS guides_update_own ensures a guide can only update their own row
  const { data, error } = await supabase.from("guides").update(update).eq("id", guide.id).select("id")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data?.length) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
