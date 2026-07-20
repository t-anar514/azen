import NextImage from "next/image"

import { Link } from "@/i18n/routing"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Section } from "@/components/ui/section"
import { ArrowLink } from "@/components/ui/arrow-link"
import { PillBadge } from "@/components/ui/pill-badge"
import type { CityRow } from "@/lib/supabase/types"

const Image = NextImage as any

const TINTS = ["sky", "saffron", "sage", "lilac"] as const

interface CitiesGridProps {
  cities: CityRow[]
  placeCountByCity: Record<string, number>
}

export function CitiesGrid({ cities, placeCountByCity }: CitiesGridProps) {
  if (cities.length === 0) return null

  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <Eyebrow>Боломжит хотууд</Eyebrow>
          <h2 className="mt-2 text-section text-foreground">Хаанаас эхлэх вэ?</h2>
        </div>
        <ArrowLink href="/essentials">Бүх хотыг үзэх</ArrowLink>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cities.map((city, i) => {
          const count = placeCountByCity[city.id] ?? 0
          return (
            <Link
              key={city.id}
              href={{ pathname: "/city/[slug]", params: { slug: city.slug ?? city.id } }}
              className="group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                {city.hero_image ? (
                  <Image
                    src={city.hero_image}
                    alt={city.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-display font-bold text-primary/20">
                    {city.name[0]}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {count > 0 && (
                  <div className="absolute left-3 top-3">
                    <PillBadge variant={TINTS[i % TINTS.length]}>{count} газар</PillBadge>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display text-xl font-bold text-white">{city.name}</p>
                  {city.teaser && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-white/80">{city.teaser}</p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Section>
  )
}
