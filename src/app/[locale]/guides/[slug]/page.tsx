import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { GuideProfileHero } from "@/components/guides/GuideProfileHero"
import { GuideProfileView, type GuideRecPlace } from "@/components/guides/GuideProfileView"
import { TrackProfileView } from "@/components/guides/TrackProfileView"
import type { GuideRow, GuideReviewRow } from "@/lib/supabase/types"

export default async function GuidePublicProfile(
  { params }: { params: Promise<{ slug: string; locale: string }> },
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: guide } = await supabase
    .from("guides").select("*").eq("slug", slug).eq("is_active", true)
    .single<GuideRow>()
  if (!guide) notFound()

  const [{ data: recs }, { data: posts }, { data: reviews }, { count: trips }, { data: cities }] =
    await Promise.all([
      supabase.from("places")
        .select("*, place_recommendations!inner(quote,guide_id)")
        .eq("place_recommendations.guide_id", guide.id)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .returns<GuideRecPlace[]>(),
      supabase.from("posts").select("*")
        .eq("author_guide_id", guide.id).eq("published", true)
        .order("published_at", { ascending: false }),
      supabase.from("guide_reviews").select("*")
        .eq("guide_id", guide.id)
        .order("created_at", { ascending: false })
        .returns<GuideReviewRow[]>(),
      supabase.from("guide_bookings")
        .select("id", { count: "exact", head: true })
        .eq("guide_id", guide.id).eq("status", "completed"),
      // places carry city_id, not a city slug — resolve the id→slug map here
      // so PlaceCard (used by GuideProfileView) can link to /city/{slug}/place/{slug}.
      supabase.from("cities").select("id, slug"),
    ])

  const citySlugById = Object.fromEntries(
    (cities ?? []).map((c: { id: string; slug: string | null }) => [c.id, c.slug ?? c.id])
  )

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TrackProfileView guideId={guide.id} />
      <GuideProfileHero guide={guide} recCount={recs?.length ?? 0} tripCount={trips ?? 0} />
      <GuideProfileView
        guide={guide}
        recs={recs ?? []}
        posts={posts ?? []}
        reviews={reviews ?? []}
        citySlugById={citySlugById}
      />
    </div>
  )
}
