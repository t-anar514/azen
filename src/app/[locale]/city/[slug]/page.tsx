import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CityHub, type PlaceRec } from "@/components/places/CityHub"
import { TrackView } from "@/components/analytics/TrackView"
import type { CityRow, PlaceRow } from "@/lib/supabase/types"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CityHubPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // slug is canonical; fall back to the raw city id so old deep links survive
  let { data: city } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .single<CityRow>()
  if (!city) {
    ;({ data: city } = await supabase
      .from("cities")
      .select("*")
      .eq("id", slug)
      .single<CityRow>())
  }
  if (!city) notFound()

  const { data: places } = await supabase
    .from("places")
    .select("*")
    .eq("city_id", city.id)
    .eq("published", true)
    .order("order_index", { ascending: true })

  const placeIds = (places ?? []).map((p: PlaceRow) => p.id)
  const { data: recs } = placeIds.length
    ? await supabase
        .from("place_recommendations")
        .select("id, place_id, quote, guides(id, name, image)")
        .in("place_id", placeIds)
    : { data: [] }

  return (
    <>
      <TrackView event="city_hub_viewed" props={{ city_id: city.id }} />
      <CityHub
        city={city}
        places={places ?? []}
        recs={(recs ?? []) as unknown as PlaceRec[]}
      />
    </>
  )
}
