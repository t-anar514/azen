"use client"

import * as React from "react"
import { MapPin, Users } from "lucide-react"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import type { TocEntry } from "@/lib/blog/article"

export interface AsideCity {
  slug: string
  name: string
  placeCount: number
  guideCount: number
}

/**
 * Sticky reading rail: table of contents with scroll-spy, plus a short
 * "in this city" cross-sell.
 *
 * Active-section tracking is a scroll listener rather than an
 * IntersectionObserver because the rule the design shows is "the last heading
 * you scrolled past", which IO expresses awkwardly — a heading scrolled well
 * above the viewport stops intersecting, so IO alone loses the active state in
 * the middle of a long section.
 */
export function ArticleAside({ toc, city }: { toc: TocEntry[]; city: AsideCity | null }) {
  const [active, setActive] = React.useState<string | null>(toc[0]?.id ?? null)

  React.useEffect(() => {
    if (!toc.length) return
    const ids = toc.map((t) => t.id)

    const sync = () => {
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= 120) current = id
      }
      setActive(current)
    }

    sync()
    window.addEventListener("scroll", sync, { passive: true })
    window.addEventListener("resize", sync)
    return () => {
      window.removeEventListener("scroll", sync)
      window.removeEventListener("resize", sync)
    }
  }, [toc])

  return (
    <aside className="sticky top-24 space-y-7">
      {toc.length > 0 && (
        <nav aria-label="Агуулга">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Агуулга
          </p>
          <ul className="space-y-0.5">
            {toc.map((entry) => {
              const isActive = entry.id === active
              return (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "block border-l-2 py-1.5 pl-3 text-[13px] leading-snug transition-colors",
                      isActive
                        ? "border-primary font-semibold text-primary"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    {entry.text}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {city && (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Энэ хотод
          </p>
          <div className="space-y-2">
            <Link
              href={{ pathname: "/city/[slug]", params: { slug: city.slug } }}
              className="flex items-center gap-3 rounded-thumb border border-border bg-card px-3 py-2.5 transition-colors hover:border-sky-200 hover:bg-sky-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-well bg-tint-sky">
                <MapPin className="h-4 w-4 text-sky-700" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-foreground">
                  {city.name} хөтөч
                </span>
                <span className="block text-[11.5px] text-muted-foreground">
                  {city.placeCount} газар
                </span>
              </span>
            </Link>

            <Link
              href="/guides"
              className="flex items-center gap-3 rounded-thumb border border-border bg-card px-3 py-2.5 transition-colors hover:border-saffron/40 hover:bg-tint-saffron"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-well bg-tint-saffron">
                <Users className="h-4 w-4 text-saffron-600" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-foreground">
                  Нутгийн хөтөч
                </span>
                <span className="block text-[11.5px] text-muted-foreground">
                  {city.guideCount} боломжтой
                </span>
              </span>
            </Link>
          </div>
        </div>
      )}
    </aside>
  )
}
