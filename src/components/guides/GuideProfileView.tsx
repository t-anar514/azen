"use client"

import * as React from "react"
import { MapPin } from "lucide-react"

import { Link } from "@/i18n/routing"
import { PlaceCard } from "@/components/places/PlaceCard"
import { CATEGORY_LABEL } from "@/components/places/categoryLabels"
import { PostCard } from "@/components/blog/PostCard"
import { PillBadge } from "@/components/ui/pill-badge"
import { GuideReviewList } from "@/components/guides/GuideReviewList"
import { cn } from "@/lib/utils"
import type { GuideRow, GuideReviewRow, PlaceRow, PostRow } from "@/lib/supabase/types"

export type GuideRecPlace = PlaceRow & {
  place_recommendations: { quote: string; guide_id: string }[]
}

const TAG_TINTS = ["sky", "saffron", "sage", "lilac"] as const

type TabId = "recs" | "posts" | "reviews" | "about"

const TABS: { id: TabId; label: string }[] = [
  { id: "recs", label: "Зөвлөмж" },
  { id: "posts", label: "Нийтлэл" },
  { id: "reviews", label: "Сэтгэгдэл" },
  { id: "about", label: "Тухай" },
]

type RecFilter = "all" | "do" | "eat" | "night"

const REC_FILTERS: { id: RecFilter; label: string; categories: PlaceRow["category"][] | null }[] = [
  { id: "all", label: "Бүгд", categories: null },
  { id: "do", label: "Юу үзэх", categories: ["things_to_do", "shopping", "day_trip"] },
  { id: "eat", label: "Хаана хооллох", categories: ["places_to_eat"] },
  { id: "night", label: "Шөнийн амьдрал", categories: ["nightlife"] },
]

interface GuideProfileViewProps {
  guide: GuideRow
  recs: GuideRecPlace[]
  posts: PostRow[]
  reviews: GuideReviewRow[]
  citySlugById: Record<string, string>
}

/**
 * Tab shell for the public guide profile (design doc, Screen 12 / 13):
 * Зөвлөмж (filterable PlaceCard grid) / Нийтлэл (blog cards) / Сэтгэгдэл
 * (GuideReviewList) / Тухай (long-form bio).
 */
export function GuideProfileView({ guide, recs, posts, reviews, citySlugById }: GuideProfileViewProps) {
  const [tab, setTab] = React.useState<TabId>("recs")
  const [filter, setFilter] = React.useState<RecFilter>("all")

  const filteredRecs = React.useMemo(() => {
    const def = REC_FILTERS.find((f) => f.id === filter)
    if (!def?.categories) return recs
    return recs.filter((p) => def.categories!.includes(p.category))
  }, [recs, filter])

  const tabCount: Record<TabId, number | null> = {
    recs: recs.length,
    posts: posts.length,
    reviews: guide.review_count,
    about: null,
  }

  return (
    <div className="mx-auto max-w-content px-4 pb-16 pt-6 md:px-8">
      {/* ── Tabs ── */}
      <div className="flex items-center gap-5 overflow-x-auto border-b border-border text-[14.5px] font-semibold [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-[2.5px] pb-3 pt-1 transition-colors",
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {tabCount[id] !== null && (
              <span className="ml-1 text-muted-foreground">{tabCount[id]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="pt-6">
        {tab === "recs" && (
          <section>
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-extrabold text-foreground">
                {guide.name}-ийн зөвлөсөн газрууд
              </h2>
              <div className="flex flex-wrap gap-2 text-[12.5px] font-semibold">
                {REC_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded-pill px-3.5 py-1.5 transition-colors",
                      filter === f.id
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredRecs.length === 0 ? (
              <p className="rounded-card border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Энэ ангилалд зөвлөмж алга.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRecs.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    citySlug={citySlugById[place.city_id] ?? place.city_id}
                    categoryLabel={CATEGORY_LABEL[place.category]}
                    rec={{
                      guide: { id: guide.id, name: guide.name, image: guide.image },
                      quote: place.place_recommendations[0]?.quote ?? "",
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "posts" && (
          <section>
            <div className="mb-3.5 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-extrabold text-foreground">
                {guide.name}-ийн нийтлэлүүд
              </h2>
              <Link href="/blog" className="text-sm font-semibold text-primary">
                Бүгд →
              </Link>
            </div>

            {posts.length === 0 ? (
              <p className="rounded-card border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Одоогоор нийтлэл алга.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "reviews" && <GuideReviewList reviews={reviews} guideId={guide.id} />}

        {tab === "about" && (
          <section className="max-w-2xl space-y-5">
            {guide.bio && (
              <p className="text-[15px] leading-relaxed text-foreground/90">{guide.bio}</p>
            )}
            {guide.location && (
              <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {guide.location}
              </p>
            )}
            {guide.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag, i) => (
                  <PillBadge key={tag} variant={TAG_TINTS[i % TAG_TINTS.length]}>
                    {tag}
                  </PillBadge>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
