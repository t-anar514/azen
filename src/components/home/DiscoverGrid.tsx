import { Eyebrow } from "@/components/ui/eyebrow"
import { Section } from "@/components/ui/section"
import { ArrowLink } from "@/components/ui/arrow-link"
import { PlaceCard } from "@/components/places/PlaceCard"
import { CATEGORY_LABEL } from "@/components/places/categoryLabels"
import type { PlaceRow } from "@/lib/supabase/types"
import type { PlaceRec } from "@/components/places/CityHub"

interface DiscoverGridProps {
  places: PlaceRow[]
  recs: PlaceRec[]
  citySlugById: Record<string, string>
}

/** Онцлох газрууд — a cross-city sampler of the places layer. */
export function DiscoverGrid({ places, recs, citySlugById }: DiscoverGridProps) {
  if (places.length === 0) return null

  const recByPlace: Record<string, PlaceRec> = {}
  for (const rec of recs) {
    if (!recByPlace[rec.place_id]) recByPlace[rec.place_id] = rec
  }

  return (
    <Section tint="muted">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <Eyebrow>Нутгийнхны сонголт</Eyebrow>
          <h2 className="mt-2 text-section text-foreground">Онцлох газрууд</h2>
        </div>
        <ArrowLink href="/essentials">Бүх газар</ArrowLink>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {places.map((place) => {
          const rec = recByPlace[place.id]
          return (
            <PlaceCard
              key={place.id}
              place={place}
              citySlug={citySlugById[place.city_id] ?? place.city_id}
              categoryLabel={CATEGORY_LABEL[place.category]}
              rec={rec?.guides ? { guide: rec.guides, quote: rec.quote } : null}
            />
          )
        })}
      </div>
    </Section>
  )
}
