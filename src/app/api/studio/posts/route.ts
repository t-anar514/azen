import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { guideSlug } from "@/lib/guides/slug"
import { readMinutes } from "@/lib/blog/readMinutes"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })
  const { data: guide } = await supabase
    .from("guides").select("id").eq("profile_id", user.id).single()
  if (!guide) return NextResponse.json({ error: "not a guide" }, { status: 403 })

  const b = await req.json().catch(() => ({}))
  if (!b.title || !b.body)
    return NextResponse.json({ error: "invalid" }, { status: 400 })

  // de-dupe the slug against every slug this session can see (own posts +
  // published posts); a true collision with someone else's unpublished draft
  // still fails cleanly on the `posts.slug` unique constraint below.
  const { data: existing } = await supabase.from("posts").select("slug")
  const slugs = new Set((existing ?? []).map((p) => p.slug as string))
  const slug = guideSlug(b.title, slugs)
  const published = !!b.published

  // posts_guide_manage_own grants the inserting guide select-back → safe
  const { data, error } = await supabase.from("posts").insert({
    id: slug,
    slug,
    type: "guide_story",
    title: b.title,
    category: b.category ?? null,
    cover_image: b.coverImage ?? null,
    body_md: b.body,
    read_minutes: readMinutes({ body_md: b.body }),
    author_guide_id: guide.id,
    created_by: user.id,
    published,
    published_at: published ? new Date().toISOString() : null,
  }).select("id,slug").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

// PATCH { id, ...fields } — edits a guide's own post. `title` may change
// without re-deriving the slug/id (stable URLs once created); `read_minutes`
// is recomputed whenever `body` changes, mirroring the POST computation.
const FIELD_MAP: Record<string, string> = {
  title: "title",
  category: "category",
  coverImage: "cover_image",
  body: "body_md",
  published: "published",
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

  const update: Record<string, unknown> = {}
  for (const [key, column] of Object.entries(FIELD_MAP)) {
    if (key in b) update[column] = b[key]
  }
  if (typeof update.body_md === "string") {
    update.read_minutes = readMinutes({ body_md: update.body_md })
  }
  if (update.published === true) update.published_at = new Date().toISOString()

  // RLS posts_guide_manage_own ensures only the authoring guide can update
  const { data, error } = await supabase.from("posts").update(update).eq("id", b.id).select("id")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data?.length) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
