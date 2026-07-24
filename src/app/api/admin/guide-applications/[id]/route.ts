import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"
import { guideSlug } from "@/lib/guides/slug"

interface Params {
  params: Promise<{ id: string }>
}

/**
 * Approve or reject a guide application (admin "Батлах хүсэлт" queue).
 *
 * Approving promotes the application into a real, active guide row — and
 * carries `user_id` over as `profile_id`, which is what flips that account's
 * profiles.role to 'guide' via the trg_sync_guide_role trigger (0001_init).
 * A slug is generated here so the new guide is immediately reachable at
 * /guides/[slug]; without it their public profile would 404.
 */
export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const body = await request.json().catch(() => null)
  const action = body?.action
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 })
  }

  const { data: application } = await supabase
    .from("guide_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!application) return NextResponse.json({ error: "not found" }, { status: 404 })
  if (application.status !== "pending") {
    return NextResponse.json({ error: "already handled" }, { status: 409 })
  }

  if (action === "reject") {
    const { error } = await supabase
      .from("guide_applications")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, status: "rejected" })
  }

  // ── approve ──────────────────────────────────────────────────────────────
  let location: string | null = null
  if (application.city_id) {
    const { data: city } = await supabase
      .from("cities")
      .select("name")
      .eq("id", application.city_id)
      .maybeSingle()
    location = city?.name ?? null
  }

  const { data: existing } = await supabase.from("guides").select("slug")
  const taken = new Set(
    (existing ?? []).map((g: { slug: string | null }) => g.slug).filter(Boolean) as string[]
  )

  const { data: created, error: guideError } = await supabase
    .from("guides")
    .insert({
      name: application.full_name,
      slug: guideSlug(application.full_name, taken),
      location,
      bio: application.bio,
      tags: application.languages ?? [],
      profile_id: application.user_id,
      is_active: true,
      is_verified: false,
    })
    .select("id")
    .single()

  if (guideError) return NextResponse.json({ error: guideError.message }, { status: 500 })

  const { error: statusError } = await supabase
    .from("guide_applications")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", id)

  if (statusError) {
    // The guide exists but the application is still 'pending' — surface it so
    // the admin doesn't silently approve the same person twice.
    return NextResponse.json(
      { error: `Guide created but application not marked approved: ${statusError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, status: "approved", guideId: created.id })
}
