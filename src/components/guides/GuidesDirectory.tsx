"use client"

import * as React from "react"
import { SlidersHorizontal } from "lucide-react"

import { GuideDirectoryCard } from "@/components/guides/GuideDirectoryCard"
import { cn } from "@/lib/utils"
import type { GuideRow } from "@/lib/supabase/types"

interface GuidesDirectoryProps {
  guides: GuideRow[]
}

type SortKey = "rating" | "price_low" | "price_high"

const SORTS: { id: SortKey; label: string }[] = [
  { id: "rating", label: "Үнэлгээ" },
  { id: "price_low", label: "Үнэ: багаас" },
  { id: "price_high", label: "Үнэ: ихээс" },
]

/** Directory shell (design doc, Screen 04): left filter panel + sorted results. */
export function GuidesDirectory({ guides }: GuidesDirectoryProps) {
  const [location, setLocation] = React.useState<string>("all")
  const [specialty, setSpecialty] = React.useState<string>("all")
  const [maxPrice, setMaxPrice] = React.useState<number>(6000)
  const [sort, setSort] = React.useState<SortKey>("rating")

  const locations = React.useMemo(
    () => [...new Set(guides.map((g) => g.location).filter(Boolean))] as string[],
    [guides]
  )
  const specialties = React.useMemo(
    () => [...new Set(guides.flatMap((g) => g.tags))].slice(0, 8),
    [guides]
  )

  const results = React.useMemo(() => {
    const filtered = guides.filter((g) => {
      if (location !== "all" && g.location !== location) return false
      if (specialty !== "all" && !g.tags.includes(specialty)) return false
      if ((g.price ?? 0) > maxPrice) return false
      return true
    })
    return filtered.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating
      if (sort === "price_low") return (a.price ?? 0) - (b.price ?? 0)
      return (b.price ?? 0) - (a.price ?? 0)
    })
  }, [guides, location, specialty, maxPrice, sort])

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* filter panel */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-card border border-border bg-card p-5 space-y-5">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <SlidersHorizontal className="size-4" /> Шүүлтүүр
          </div>

          <FilterGroup
            label="Байршил"
            options={[{ id: "all", label: "Бүгд" }, ...locations.map((l) => ({ id: l, label: l }))]}
            value={location}
            onChange={setLocation}
          />

          {specialties.length > 0 && (
            <FilterGroup
              label="Мэргэшил"
              options={[{ id: "all", label: "Бүгд" }, ...specialties.map((s) => ({ id: s, label: s }))]}
              value={specialty}
              onChange={setSpecialty}
            />
          )}

          <div className="space-y-2">
            <p className="text-eyebrow">Цагийн хөлс (¥)</p>
            <input
              type="range"
              min={2000}
              max={6000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Дээд үнэ"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>¥2,000</span>
              <span className="font-semibold text-foreground">≤ ¥{maxPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* results */}
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <b className="font-semibold text-foreground">{results.length}</b> хөтөч олдлоо
          </p>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Эрэмбэлэх:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-pill border border-input bg-card px-3 text-sm font-semibold text-foreground outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {results.length === 0 ? (
          <div className="rounded-card border border-dashed border-border p-12 text-center text-muted-foreground">
            Шүүлтүүрт тохирох хөтөч алга. Нөхцөлөө өөрчилж үзээрэй.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {results.map((guide) => (
              <GuideDirectoryCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { id: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-eyebrow">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-pill border px-3 py-1 text-xs font-semibold transition-colors",
              value === opt.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
