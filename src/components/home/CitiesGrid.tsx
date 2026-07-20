import NextImage from "next/image"

import { Link } from "@/i18n/routing"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Section } from "@/components/ui/section"
import { ArrowLink } from "@/components/ui/arrow-link"
import { cn } from "@/lib/utils"
import type { CityRow } from "@/lib/supabase/types"

const Image = NextImage as any

interface CitiesGridProps {
  cities: CityRow[]
  placeCountByCity: Record<string, number>
}

/**
 * Mosaic layout (design doc, Screen 01 — Featured cities): the lead city gets a
 * tall 2×2 tile with its teaser, the rest are compact tiles beside it.
 */
export function CitiesGrid({ cities, placeCountByCity }: CitiesGridProps) {
  if (cities.length === 0) return null

  const [lead, ...rest] = cities

  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <Eyebrow>Хаанаас эхлэх вэ</Eyebrow>
          <h2 className="mt-2 text-section text-foreground">Хотоо сонго</h2>
        </div>
        <ArrowLink href="/essentials">Бүх хот</ArrowLink>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        <CityTile
          city={lead}
          count={placeCountByCity[lead.id] ?? 0}
          className="sm:col-span-2 lg:row-span-2"
          featured
        />
        {rest.slice(0, 4).map((city) => (
          <CityTile key={city.id} city={city} count={placeCountByCity[city.id] ?? 0} />
        ))}
      </div>
    </Section>
  )
}

function CityTile({
  city,
  count,
  className,
  featured = false,
}: {
  city: CityRow
  count: number
  className?: string
  featured?: boolean
}) {
  return (
    <Link
      href={{ pathname: "/city/[slug]", params: { slug: city.slug ?? city.id } }}
      className={cn(
        "group relative overflow-hidden rounded-card bg-muted shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
        featured ? "min-h-[320px] lg:min-h-[420px]" : "min-h-[150px] lg:min-h-[200px]",
        className
      )}
    >
      {city.hero_image ? (
        <Image
          src={city.hero_image}
          alt={city.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-5xl font-display font-bold text-primary/20">
          {city.name[0]}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        {count > 0 && (
          <span className="inline-block rounded-pill bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-foreground backdrop-blur-sm">
            {count} газар
          </span>
        )}
        <p
          className={cn(
            "mt-1.5 font-display font-extrabold text-white",
            featured ? "text-3xl md:text-4xl" : "text-lg"
          )}
        >
          {city.name}
        </p>
        {featured && city.teaser && (
          <p className="mt-1 max-w-md text-sm text-white/85 line-clamp-2">{city.teaser}</p>
        )}
      </div>
    </Link>
  )
}
