"use client"

import * as React from "react"
import NextImage from "next/image"

import { Link } from "@/i18n/routing"
import { PostCard } from "@/components/blog/PostCard"
import { cn } from "@/lib/utils"
import type { PostRow } from "@/lib/supabase/types"

const Image = NextImage as any

interface BlogIndexProps {
  posts: PostRow[]
  categoryLabels: Record<string, string>
}

/**
 * Blog index (design doc, Screen 07): eyebrow + title, category filter chips,
 * a featured lead post, then a 3-col grid of the rest.
 */
export function BlogIndex({ posts, categoryLabels }: BlogIndexProps) {
  const [active, setActive] = React.useState<string>("all")

  const categories = React.useMemo(() => {
    const seen = new Map<string, string>()
    for (const p of posts) {
      if (p.category) seen.set(p.category, categoryLabels[p.category] ?? p.category)
    }
    return [...seen.entries()]
  }, [posts, categoryLabels])

  const filtered = React.useMemo(
    () => (active === "all" ? posts : posts.filter((p) => p.category === active)),
    [posts, active]
  )

  const [featured, ...rest] = filtered

  return (
    <div className="space-y-8">
      {/* filter chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Chip label="Бүгд" active={active === "all"} onClick={() => setActive("all")} />
          {categories.map(([id, label]) => (
            <Chip key={id} label={label} active={active === id} onClick={() => setActive(id)} />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-card border border-dashed border-border p-12 text-center text-muted-foreground">
          Энэ ангилалд нийтлэл алга.
        </p>
      ) : (
        <>
          {/* featured lead */}
          {featured && (
            <Link
              href={{ pathname: "/blog/[slug]", params: { slug: featured.slug } }}
              className="group grid overflow-hidden rounded-card border border-border bg-card shadow-sm transition-all hover:shadow-xl lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] bg-muted lg:aspect-auto">
                {featured.cover_image ? (
                  <Image
                    src={featured.cover_image}
                    alt={featured.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full min-h-[220px] w-full items-center justify-center text-5xl font-display font-bold text-primary/20">
                    {featured.title[0]}
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-pill bg-saffron px-3 py-1 text-xs font-bold text-white">
                  ✦ Онцлох
                </span>
              </div>
              <div className="flex flex-col justify-center gap-3 p-6 md:p-10">
                {featured.category && (
                  <span className="text-eyebrow">
                    {categoryLabels[featured.category] ?? featured.category}
                  </span>
                )}
                <h2 className="font-display text-2xl font-extrabold leading-tight text-foreground group-hover:text-primary transition-colors md:text-3xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-muted-foreground line-clamp-3">{featured.excerpt}</p>
                )}
                {featured.read_minutes && (
                  <p className="text-sm text-muted-foreground">{featured.read_minutes} мин унших</p>
                )}
              </div>
            </Link>
          )}

          {/* grid */}
          {rest.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  categoryLabel={post.category ? categoryLabels[post.category] : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill border px-4 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  )
}
