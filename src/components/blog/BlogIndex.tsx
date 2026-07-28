"use client"

import * as React from "react"
import NextImage from "next/image"

import { Link } from "@/i18n/routing"
import { PostCard } from "@/components/blog/PostCard"
import { PillBadge } from "@/components/ui/pill-badge"
import { cn, initials } from "@/lib/utils"
import { postGradient } from "@/lib/blog/gradient"
import type { PostRow } from "@/lib/supabase/types"

const Image = NextImage as any

export interface PostAuthor {
  name: string
  image: string | null
}

interface BlogIndexProps {
  posts: PostRow[]
  categoryLabels: Record<string, string>
  authors?: Record<string, PostAuthor>
}

/**
 * Blog index (design doc, Screen 07 / mobile Screen 13): filter chips, a
 * featured lead post, then the rest. Mobile shows the lead as an overlay card
 * and the rest as horizontal thumbnail rows; desktop keeps the split hero + grid.
 */
export function BlogIndex({ posts, categoryLabels, authors = {} }: BlogIndexProps) {
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
    <div className="px-5 pt-4 md:space-y-8 md:px-0 md:pt-0">
      {/* filter chips — single scrolling row on mobile, wrap on desktop */}
      {categories.length > 0 && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip label="Бүгд" active={active === "all"} onClick={() => setActive("all")} />
          {categories.map(([id, label]) => (
            <Chip key={id} label={label} active={active === id} onClick={() => setActive(id)} />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-card border border-dashed border-border p-12 text-center text-muted-foreground">
          Энэ ангилалд нийтлэл алга.
        </p>
      ) : (
        <>
          {/* ── Mobile: overlay featured + thumbnail rows ── */}
          <div className="md:hidden">
            {featured && (
              <Link
                href={{ pathname: "/blog/[slug]", params: { slug: featured.slug } }}
                className="relative mt-4 block h-[200px] overflow-hidden rounded-[20px]"
                style={{ background: postGradient(featured.slug) }}
              >
                {featured.cover_image && (
                  <Image src={featured.cover_image} alt={featured.title} fill className="object-cover" />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(transparent, rgba(10,27,46,.85))" }}
                />
                <div className="absolute inset-x-4 bottom-4 text-white">
                  {featured.category && (
                    <span className="rounded-pill bg-white/20 px-2.5 py-1 text-[10.5px] font-bold">
                      {categoryLabels[featured.category] ?? featured.category}
                    </span>
                  )}
                  <h2 className="mb-1.5 mt-2.5 font-display text-[19px] font-extrabold leading-[1.2]">
                    {featured.title}
                  </h2>
                  <AuthorLine author={authors[featured.id]} readMinutes={featured.read_minutes} />
                </div>
              </Link>
            )}

            <div className="mt-4 flex flex-col gap-3.5">
              {rest.map((post) => (
                <Link
                  key={post.id}
                  href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}
                  className="flex gap-3.5"
                >
                  <div
                    className="relative h-[74px] w-24 shrink-0 overflow-hidden rounded-[14px]"
                    style={post.cover_image ? undefined : { background: postGradient(post.slug) }}
                  >
                    {post.cover_image && (
                      <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {post.category && (
                      <PillBadge variant="sage">{categoryLabels[post.category] ?? post.category}</PillBadge>
                    )}
                    <h3 className="mt-1.5 font-display text-sm font-bold leading-[1.3] text-foreground line-clamp-2">
                      {post.title}
                    </h3>
                    {post.read_minutes && (
                      <div className="mt-1 text-[11px] text-[#94A3B8]">{post.read_minutes} мин унших</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Desktop: split hero + grid ── */}
          <div className="hidden md:block md:space-y-8">
            {featured && (
              <Link
                href={{ pathname: "/blog/[slug]", params: { slug: featured.slug } }}
                className="group grid overflow-hidden rounded-card border border-border bg-card shadow-sm transition-all hover:shadow-xl lg:grid-cols-2"
              >
                <div
                  className="relative aspect-[16/10] min-h-[200px] bg-muted lg:aspect-auto"
                  style={featured.cover_image ? undefined : { background: postGradient(featured.slug) }}
                >
                  {featured.cover_image && (
                    <Image
                      src={featured.cover_image}
                      alt={featured.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
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
                  <h2 className="font-display text-2xl font-extrabold leading-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="line-clamp-3 text-muted-foreground">{featured.excerpt}</p>
                  )}
                  {featured.read_minutes && (
                    <p className="text-sm text-muted-foreground">{featured.read_minutes} мин унших</p>
                  )}
                </div>
              </Link>
            )}

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
          </div>
        </>
      )}
    </div>
  )
}

function AuthorLine({ author, readMinutes }: { author?: PostAuthor; readMinutes: number | null }) {
  return (
    <div className="flex items-center gap-1.5 text-[11.5px] text-white/80">
      {author &&
        (author.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.image} alt={author.name} className="size-5 rounded-full object-cover" />
        ) : (
          <span className="flex size-5 items-center justify-center rounded-full bg-saffron text-[9px] font-bold text-white">
            {initials(author.name)}
          </span>
        ))}
      {author && <span>{author.name}</span>}
      {author && readMinutes != null && <span aria-hidden>·</span>}
      {readMinutes != null && <span>{readMinutes} мин</span>}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-pill border px-4 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  )
}
