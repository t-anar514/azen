import type { SupabaseClient } from "@supabase/supabase-js"
import { weekDeltaPct, sumCompleted } from "./statsMath"

// ⚠ Client contract: pass the SERVICE-ROLE client (`createAdminClient()`)
// from server code only, with a guideId taken from an RLS-verified session
// (`requireGuide()`). The views/saves counts read `analytics_events` (RLS:
// admin-only SELECT, 0015) and `saved_items` (RLS: own rows only, 0013) — a
// session-scoped client silently counts 0 there. These helpers only ever
// return aggregate counts scoped to that verified guide, never rows, which
// is the same trust boundary as /api/analytics (service-role writes).

const WEEK = 7 * 24 * 60 * 60 * 1000

export interface GuideStats {
  views: { total: number; deltaPct: number }
  saves: { total: number; deltaPct: number }
  bookings: { total: number; pending: number }
  rating: { value: number; count: number }
  earnings: number
}

async function countEvents(
  s: SupabaseClient, name: string, guideId: string, since?: string, until?: string,
) {
  let q = s.from("analytics_events").select("id", { count: "exact", head: true })
    .eq("name", name).eq("props->>guide_id", guideId)
  if (since) q = q.gte("created_at", since)
  if (until) q = q.lt("created_at", until)
  const { count } = await q
  return count ?? 0
}

export async function loadGuideStats(
  s: SupabaseClient, guideId: string,
): Promise<GuideStats> {
  const now = Date.now()
  const wk1 = new Date(now - WEEK).toISOString()
  const wk2 = new Date(now - 2 * WEEK).toISOString()

  // profile views (all-time + weekly windows)
  const [viewsTotal, viewsThis, viewsPrev] = await Promise.all([
    countEvents(s, "guide_profile_viewed", guideId),
    countEvents(s, "guide_profile_viewed", guideId, wk1),
    countEvents(s, "guide_profile_viewed", guideId, wk2, wk1),
  ])

  // the guide's published place ids (for saves attribution)
  const { data: places } = await s
    .from("places").select("id").eq("created_by_guide_id", guideId)
  const placeIds = (places ?? []).map(p => p.id)

  let savesTotal = 0, savesThis = 0, savesPrev = 0
  if (placeIds.length) {
    const base = () => s.from("saved_items")
      .select("id", { count: "exact", head: true })
      .eq("item_type", "place").in("item_id", placeIds)
    const [{ count: t }, { count: a }, { count: b }] = await Promise.all([
      base(),
      base().gte("created_at", wk1),
      base().gte("created_at", wk2).lt("created_at", wk1),
    ])
    savesTotal = t ?? 0; savesThis = a ?? 0; savesPrev = b ?? 0
  }

  const { data: bookings } = await s
    .from("guide_bookings").select("amount,status").eq("guide_id", guideId)
  const b = bookings ?? []
  const { data: g } = await s
    .from("guides").select("rating,review_count").eq("id", guideId).single()

  return {
    views:  { total: viewsTotal, deltaPct: weekDeltaPct(viewsThis, viewsPrev) },
    saves:  { total: savesTotal, deltaPct: weekDeltaPct(savesThis, savesPrev) },
    bookings: { total: b.length, pending: b.filter(x => x.status === "pending").length },
    rating: { value: Number(g?.rating ?? 5), count: g?.review_count ?? 0 },
    earnings: sumCompleted(b as { amount: number; status: string }[]),
  }
}

export interface GuideRecRow {
  id: string; name: string; city_id: string; category: string
  published: boolean; views: number; saves: number
}

export async function loadGuideRecRows(
  s: SupabaseClient, guideId: string,
): Promise<GuideRecRow[]> {
  const { data: places } = await s.from("places")
    .select("id,name,city_id,category,published")
    .eq("created_by_guide_id", guideId)
    .order("created_at", { ascending: false })
  const rows = places ?? []
  return Promise.all(rows.map(async (p) => {
    const [{ count: views }, { count: saves }] = await Promise.all([
      s.from("analytics_events").select("id", { count: "exact", head: true })
        .eq("name", "place_viewed").eq("props->>place_id", p.id),
      s.from("saved_items").select("id", { count: "exact", head: true })
        .eq("item_type", "place").eq("item_id", p.id),
    ])
    return { id: p.id, name: p.name, city_id: p.city_id, category: p.category,
             published: p.published, views: views ?? 0, saves: saves ?? 0 }
  }))
}
