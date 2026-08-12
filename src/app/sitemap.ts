import type { MetadataRoute } from "next"

import { createAnonClient } from "@/lib/supabase/anon"
import { absoluteUrl } from "@/lib/siteUrl"

/**
 * Rebuild the sitemap at most once an hour rather than on every crawl — the
 * underlying content changes far more slowly than bots ask for it, and each
 * regeneration costs four Supabase queries.
 */
export const revalidate = 3600

/**
 * Static public routes, with a priority reflecting how central each is to the
 * product. Auth, admin, driver and per-user routes are deliberately absent —
 * see robots.ts for the matching disallow list.
 */
const STATIC_ROUTES: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
}> = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/planner", priority: 0.9, changeFrequency: "monthly" },
  { path: "/guides", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" },
  { path: "/essentials", priority: 0.8, changeFrequency: "weekly" },
  { path: "/experiences", priority: 0.7, changeFrequency: "weekly" },
  { path: "/transfer", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tours/custom", priority: 0.7, changeFrequency: "monthly" },
  { path: "/flights", priority: 0.6, changeFrequency: "weekly" },
  { path: "/learn", priority: 0.6, changeFrequency: "weekly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  // Supply-side funnels: low priority, but they should still be findable.
  { path: "/guides/apply", priority: 0.4, changeFrequency: "monthly" },
  { path: "/driver/apply", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
]

/** Falls back to now when a row has no usable timestamp. */
function lastModified(...candidates: Array<string | null | undefined>): Date {
  for (const candidate of candidates) {
    if (!candidate) continue
    const parsed = new Date(candidate)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return new Date()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // A sitemap must never be the reason a deploy fails. If Supabase is
  // unreachable at build time we still emit the static routes rather than
  // throwing — a partial sitemap beats none.
  try {
    // Deliberately the cookie-free anon client: `lib/supabase/server.ts` reads
    // cookies(), which opts this route into dynamic rendering and throws at
    // build time. See lib/supabase/anon.ts.
    const supabase = createAnonClient()

    const [cities, places, posts, guides] = await Promise.all([
      supabase.from("cities").select("slug, id, updated_at").eq("published", true),
      supabase.from("places").select("slug, city_id, updated_at").eq("published", true),
      supabase.from("posts").select("slug, updated_at, published_at").eq("published", true),
      supabase.from("guides").select("slug, updated_at").eq("is_active", true),
    ])

    // cities.slug is nullable and backfilled as `<id>-jp`; fall back to the id
    // so a row that missed the backfill still gets a valid URL.
    const citySlugById = new Map<string, string>()
    for (const city of cities.data ?? []) {
      const slug = city.slug ?? city.id
      citySlugById.set(city.id, slug)
      entries.push({
        url: absoluteUrl(`/city/${slug}`),
        lastModified: lastModified(city.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }

    for (const place of places.data ?? []) {
      const citySlug = citySlugById.get(place.city_id)
      // Skip places whose city is unpublished — the URL nests under the city,
      // so without a published parent the page isn't reachable anyway.
      if (!citySlug) continue
      entries.push({
        url: absoluteUrl(`/city/${citySlug}/place/${place.slug}`),
        lastModified: lastModified(place.updated_at),
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }

    for (const post of posts.data ?? []) {
      entries.push({
        url: absoluteUrl(`/blog/${post.slug}`),
        lastModified: lastModified(post.updated_at, post.published_at),
        changeFrequency: "monthly",
        priority: 0.7,
      })
    }

    for (const guide of guides.data ?? []) {
      if (!guide.slug) continue
      entries.push({
        url: absoluteUrl(`/guides/${guide.slug}`),
        lastModified: lastModified(guide.updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  } catch (error) {
    console.error("[sitemap] falling back to static routes only:", error)
  }

  return entries
}
