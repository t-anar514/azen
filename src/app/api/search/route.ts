import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { PlaceRow } from "@/lib/supabase/types"

// DB-backed slice of the ⌘K search index: places and posts live in Postgres,
// so they can't come from the static data files GlobalSearch imports. The
// client merges these with the static entries (cities, experiences, phrases).
export const revalidate = 300

const CATEGORY_LABEL: Record<PlaceRow["category"], string> = {
  things_to_do: "Үзэх зүйл",
  places_to_eat: "Хоол",
  nightlife: "Шөнийн амьдрал",
  shopping: "Шопинг",
  day_trip: "Өдрийн аялал",
}

export async function GET() {
  const supabase = await createClient()

  const [{ data: places }, { data: cities }, { data: posts }, { data: guides }] =
    await Promise.all([
      supabase
        .from("places")
        .select("id, name, slug, city_id, neighborhood, category, short_desc")
        .eq("published", true)
        .order("order_index"),
      supabase.from("cities").select("id, slug"),
      supabase
        .from("posts")
        .select("id, slug, title, excerpt, category")
        .eq("published", true),
      supabase
        .from("guides")
        .select("id, name, slug, location, tags, bio")
        .eq("is_active", true)
        .order("name"),
    ])

  const citySlug: Record<string, string> = Object.fromEntries(
    (cities ?? []).map((c: { id: string; slug: string | null }) => [c.id, c.slug ?? c.id])
  )

  const placeItems = (places ?? []).map((p: any) => ({
    id: `place-${p.id}`,
    title: p.name as string,
    subtitle: [CATEGORY_LABEL[p.category as PlaceRow["category"]], p.neighborhood]
      .filter(Boolean)
      .join(" · "),
    category: "Places" as const,
    url: `/city/${citySlug[p.city_id] ?? p.city_id}/place/${p.slug}`,
  }))

  const postItems = (posts ?? []).map((p: any) => ({
    id: `post-${p.id}`,
    title: p.title as string,
    subtitle: (p.excerpt as string) ?? "",
    category: "Posts" as const,
    url: `/blog/${p.slug}`,
  }))

  const guideItems = (guides ?? [])
    .filter((g: any) => g.slug)
    .map((g: any) => ({
      id: `guide-${g.id}`,
      title: g.name as string,
      subtitle: [g.location, ...(Array.isArray(g.tags) ? g.tags.slice(0, 2) : [])]
        .filter(Boolean)
        .join(" · "),
      category: "Guides" as const,
      url: `/guides/${g.slug}`,
    }))

  return NextResponse.json({ items: [...placeItems, ...postItems, ...guideItems] })
}
