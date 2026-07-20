"use client"

import * as React from "react"
import NextImage from "next/image"
import { Link } from "@/i18n/routing"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PlaceRow } from "@/lib/supabase/types"

const Image = NextImage as any

interface MapBottomSheetProps {
  places: PlaceRow[]
  citySlug: string
  selectedId: string | null
  onSelect: (id: string) => void
}

// Horizontal card strip under the map; scrolls the selected pin's card into view.
export function MapBottomSheet({ places, citySlug, selectedId, onSelect }: MapBottomSheetProps) {
  const refs = React.useRef<Record<string, HTMLDivElement | null>>({})

  React.useEffect(() => {
    if (selectedId && refs.current[selectedId]) {
      refs.current[selectedId]!.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      })
    }
  }, [selectedId])

  if (places.length === 0) return null

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
      {places.map((place) => (
        <div
          key={place.id}
          ref={(el) => {
            refs.current[place.id] = el
          }}
          onClick={() => onSelect(place.id)}
          className={cn(
            "w-[240px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-thumb border bg-card transition-all",
            place.id === selectedId
              ? "border-primary shadow-lg"
              : "border-border shadow-sm hover:shadow-md"
          )}
        >
          <div className="relative h-24 bg-muted">
            {place.cover_image ? (
              <Image src={place.cover_image} alt={place.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-display font-bold text-primary/20">
                {place.name[0]}
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="truncate text-sm font-bold text-foreground">{place.name}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              {place.neighborhood && (
                <>
                  <MapPin className="size-3 shrink-0" /> {place.neighborhood}
                </>
              )}
              {place.price_band ? <span> · {"¥".repeat(place.price_band)}</span> : null}
            </p>
            <Link
              href={{
                pathname: "/city/[slug]/place/[placeSlug]",
                params: { slug: citySlug, placeSlug: place.slug },
              }}
              className="mt-1 inline-block text-xs font-semibold text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Дэлгэрэнгүй →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
