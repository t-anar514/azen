"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import NextImage from "next/image"
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Gem,
  Info,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Martini,
  Train,
  UtensilsCrossed,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { CityInfoPanels, type InfoPanel } from "@/components/places/CityInfoPanels"
import { PlaceCard } from "@/components/places/PlaceCard"
import { PlaceFilterBar, type PlaceFilters } from "@/components/places/PlaceFilterBar"
import { PlaceMap } from "@/components/places/PlaceMap"
import { MapBottomSheet } from "@/components/places/MapBottomSheet"
import { CATEGORY_LABEL } from "@/components/places/categoryLabels"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CityRow, PlaceRow } from "@/lib/supabase/types"

const Image = NextImage as any

export interface PlaceRec {
  id: string
  place_id: string
  quote: string
  guides: { id: string; name: string; image: string | null } | null
}

/**
 * One hero, one tab bar (design doc, Screen 02 — "✓ Fix: нэг hero, нэг таб мөр").
 * Place tabs and encyclopedia tabs are siblings in a single row rather than the
 * old nested arrangement.
 */
type HubTab = "overview" | "do" | "eat" | "nightlife" | "districts" | "transport" | "info"

const PLACE_TABS: Partial<Record<HubTab, PlaceRow["category"][]>> = {
  do: ["things_to_do", "shopping", "day_trip"],
  eat: ["places_to_eat"],
  nightlife: ["nightlife"],
}

const INFO_TABS: Partial<Record<HubTab, InfoPanel>> = {
  overview: "overview",
  districts: "districts",
  transport: "transport",
  info: "understand",
}

const TABS: { id: HubTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Тойм", icon: BookOpen },
  { id: "do", label: "Юу үзэх", icon: Compass },
  { id: "eat", label: "Хаана хооллох", icon: UtensilsCrossed },
  { id: "nightlife", label: "Шөнийн амьдрал", icon: Martini },
  { id: "districts", label: "Дүүргүүд", icon: MapPin },
  { id: "transport", label: "Тээвэр", icon: Train },
  { id: "info", label: "Мэдээлэл", icon: Info },
]

interface CityHubProps {
  city: CityRow
  places: PlaceRow[]
  recs: PlaceRec[]
}

export function CityHub({ city, places, recs }: CityHubProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tabParam = searchParams.get("tab") as HubTab | null
  const tab: HubTab = tabParam && TABS.some((t) => t.id === tabParam) ? tabParam : "overview"

  const [filters, setFilters] = React.useState<PlaceFilters>({ q: "", neighborhood: "", price: "" })
  const [view, setView] = React.useState<"grid" | "map">("grid")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const recsByPlace = React.useMemo(() => {
    const map: Record<string, PlaceRec[]> = {}
    for (const rec of recs) {
      if (!map[rec.place_id]) map[rec.place_id] = []
      map[rec.place_id].push(rec)
    }
    return map
  }, [recs])

  function setTab(next: HubTab) {
    const params = new URLSearchParams(searchParams.toString())
    if (next === "overview") params.delete("tab")
    else params.set("tab", next)
    router.replace(`?${params.toString()}`, { scroll: false })
    setSelectedId(null)
    setFilters({ q: "", neighborhood: "", price: "" })
  }

  const tabPlaces = React.useMemo(() => {
    const categories = PLACE_TABS[tab]
    if (!categories) return []
    return places.filter((p) => categories.includes(p.category))
  }, [tab, places])

  const filtered = React.useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    return tabPlaces.filter((p) => {
      if (filters.neighborhood && p.neighborhood !== filters.neighborhood) return false
      if (filters.price && p.price_band !== Number(filters.price)) return false
      if (q) {
        const haystack = `${p.name} ${p.short_desc ?? ""} ${p.subcategory ?? ""} ${p.tags.join(" ")}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [tabPlaces, filters])

  const neighborhoods = React.useMemo(
    () => [...new Set(tabPlaces.map((p) => p.neighborhood).filter(Boolean))] as string[],
    [tabPlaces]
  )

  const gemCount = filtered.filter((p) => p.is_hidden_gem).length
  const infoPanel = INFO_TABS[tab]

  return (
    <div className="min-h-screen bg-background">
      {/* ── SINGLE HERO ── */}
      <div className="relative h-[38vh] md:h-[46vh] overflow-hidden bg-muted">
        {city.hero_image && (
          <Image src={city.hero_image} alt={city.name} fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

        <Link
          href="/essentials"
          className="absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-pill bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/30"
        >
          <ArrowLeft className="size-4" /> Хотууд руу буцах
        </Link>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-7 md:px-6">
          <div className="mx-auto max-w-content">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {city.slug && (
                <span className="rounded-pill bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {city.name}
                </span>
              )}
              <span className="rounded-pill bg-white/90 px-3 py-1 text-xs font-bold text-foreground">
                {places.length} газар
              </span>
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              {city.name}
            </h1>
            {city.teaser && (
              <p className="mt-1.5 max-w-2xl text-white/85">{city.teaser}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── ONE UNIFIED TAB BAR ── */}
      <div className="sticky top-14 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-content px-4 md:px-6">
          <nav className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors",
                  tab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-content px-4 py-8 md:px-6">
        {infoPanel ? (
          <CityInfoPanels city={city} panel={infoPanel} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="rounded-pill bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
                  {filtered.length} газар
                </span>
                {gemCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-pill bg-tint-saffron px-3 py-1 text-sm font-semibold text-saffron-600">
                    <Gem className="size-3.5" /> {gemCount} нуугдмал эрдэнэ
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 rounded-pill border border-border p-1">
                <Button
                  type="button"
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 rounded-pill px-3"
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid className="size-4" /> Жагсаалт
                </Button>
                <Button
                  type="button"
                  variant={view === "map" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 rounded-pill px-3"
                  onClick={() => setView("map")}
                >
                  <MapIcon className="size-4" /> Газрын зураг
                </Button>
              </div>
            </div>

            <PlaceFilterBar
              neighborhoods={neighborhoods}
              filters={filters}
              onChange={setFilters}
            />

            {filtered.length === 0 ? (
              <div className="rounded-card border border-dashed border-border p-12 text-center text-muted-foreground">
                Энэ ангилалд газар алга. Шүүлтүүрээ өөрчилж үзээрэй.
              </div>
            ) : view === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((place) => {
                  const rec = recsByPlace[place.id]?.[0]
                  return (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      citySlug={city.slug ?? city.id}
                      categoryLabel={CATEGORY_LABEL[place.category]}
                      rec={rec?.guides ? { guide: rec.guides, quote: rec.quote } : null}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <PlaceMap
                  places={filtered}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  className="h-[55vh]"
                />
                <MapBottomSheet
                  places={filtered}
                  citySlug={city.slug ?? city.id}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
