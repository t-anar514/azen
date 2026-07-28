import { redirect } from "next/navigation"
import type { SupabaseClient } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import { getCurrentGuide } from "@/lib/guides/current"
import { guideFallbackPath } from "@/lib/studio/context"
import { StudioNewScreen } from "@/components/studio/StudioNewScreen"
import type { RecommendationInitial } from "@/components/studio/CreateRecommendationForm"
import type { PlaceCategory } from "@/lib/supabase/types"

interface PageProps {
  searchParams: Promise<{ id?: string; tab?: string }>
}

type PlaceEditRow = Pick<
  import("@/lib/supabase/types").PlaceRow,
  "id" | "name" | "city_id" | "neighborhood" | "category" | "price_band" | "cover_image" | "gallery" | "is_hidden_gem" | "tags"
>

async function loadInitialRec(
  supabase: SupabaseClient,
  guideId: string,
  placeId: string
): Promise<RecommendationInitial | null> {
  // created_by_guide_id filter is a defense-in-depth belt on top of RLS
  // (places_guide_manage_own already scopes selects to the owning guide).
  const { data: place } = await supabase
    .from("places")
    .select("id,name,city_id,neighborhood,category,price_band,cover_image,gallery,is_hidden_gem,tags")
    .eq("id", placeId)
    .eq("created_by_guide_id", guideId)
    .maybeSingle<PlaceEditRow>()
  if (!place) return null

  const { data: rec } = await supabase
    .from("place_recommendations")
    .select("quote")
    .eq("place_id", placeId)
    .eq("guide_id", guideId)
    .maybeSingle<{ quote: string }>()

  return {
    id: place.id,
    name: place.name,
    cityId: place.city_id,
    neighborhood: place.neighborhood,
    category: place.category as PlaceCategory,
    priceBand: place.price_band,
    coverImage: place.cover_image,
    gallery: place.gallery ?? [],
    quote: rec?.quote ?? "",
    isHiddenGem: place.is_hidden_gem,
    tags: place.tags ?? [],
  }
}

/**
 * `/studio/new` (design doc Screen 11 + mobile Screen 13) — server-fetches
 * the cities list and, when `?id=` is present, the guide's own place +
 * recommendation quote to prefill an edit session. All interactivity
 * (tab toggle, form state, submit wiring) lives in the client
 * `StudioNewScreen`.
 */
export default async function StudioNewPage({ searchParams }: PageProps) {
  const { id, tab } = await searchParams
  const ctx = await getCurrentGuide()
  if (!ctx) redirect(await guideFallbackPath())
  const { guide } = ctx
  const supabase = await createClient()

  const [{ data: cityRows }, initialRec] = await Promise.all([
    supabase.from("cities").select("id,name,slug").order("name", { ascending: true }),
    id ? loadInitialRec(supabase, guide.id, id) : Promise.resolve(null),
  ])

  const cities = (cityRows ?? []).map((c: { id: string; name: string; slug: string | null }) => ({
    id: c.id,
    name: c.name,
    slug: c.slug ?? c.id,
  }))

  return (
    <StudioNewScreen
      cities={cities}
      guideName={guide.name}
      guideImage={guide.image}
      initialTab={initialRec ? "place" : tab === "post" ? "post" : "place"}
      initialRec={initialRec}
    />
  )
}
