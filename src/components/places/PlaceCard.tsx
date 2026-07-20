import { Gem, MapPin } from "lucide-react"
import NextImage from "next/image"
import { Link } from "@/i18n/routing"

import { PillBadge } from "@/components/ui/pill-badge"
import { GuideQuote } from "@/components/places/GuideQuote"
import type { PlaceRow } from "@/lib/supabase/types"

const Image = NextImage as any

const CATEGORY_TINT: Record<PlaceRow["category"], "sky" | "saffron" | "sage" | "lilac"> = {
  things_to_do: "sky",
  places_to_eat: "saffron",
  nightlife: "lilac",
  shopping: "sage",
  day_trip: "sage",
}

interface PlaceCardProps {
  place: PlaceRow
  citySlug: string
  rec?: { guide: { id: string; name: string; image: string | null }; quote: string } | null
  categoryLabel: string
}

export function PlaceCard({ place, citySlug, rec, categoryLabel }: PlaceCardProps) {
  return (
    <Link
      href={{
        pathname: "/city/[slug]/place/[placeSlug]",
        params: { slug: citySlug, placeSlug: place.slug },
      }}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="relative aspect-[3/2] bg-muted overflow-hidden">
        {place.cover_image ? (
          <Image
            src={place.cover_image}
            alt={place.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-display font-bold text-primary/20">
            {place.name[0]}
          </div>
        )}
        <div className="absolute left-3 top-3">
          <PillBadge variant={CATEGORY_TINT[place.category]}>
            {place.subcategory ?? categoryLabel}
          </PillBadge>
        </div>
        {place.is_hidden_gem && (
          <div className="absolute right-3 top-3">
            <PillBadge variant="saffron">
              <Gem /> Нуугдмал эрдэнэ
            </PillBadge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
          {place.name}
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {place.neighborhood && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> {place.neighborhood}
            </span>
          )}
          {place.price_band ? (
            <>
              <span aria-hidden>·</span>
              <span className="font-semibold text-foreground/70">{"¥".repeat(place.price_band)}</span>
            </>
          ) : null}
        </p>
        {place.short_desc && (
          <p className="text-sm text-muted-foreground line-clamp-2">{place.short_desc}</p>
        )}
        {rec && <GuideQuote guide={rec.guide} quote={rec.quote} compact />}
      </div>
    </Link>
  )
}
