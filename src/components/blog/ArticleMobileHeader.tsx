"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"

import { Link } from "@/i18n/routing"
import { SaveHeart } from "@/components/saves/SaveHeart"

/**
 * Phone reading chrome: back affordance, the article title once it scrolls out
 * of view, a bookmark, and a read-progress hairline. Sits below the global
 * navbar (h-14) rather than replacing it, so site navigation stays reachable.
 */
export function ArticleMobileHeader({
  title,
  postId,
  targetId,
}: {
  title: string
  postId: string
  targetId: string
}) {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const sync = () => {
      const el = document.getElementById(targetId)
      if (!el) return
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) {
        setProgress(1)
        return
      }
      const passed = window.scrollY - el.offsetTop
      setProgress(Math.min(1, Math.max(0, passed / total)))
    }

    sync()
    window.addEventListener("scroll", sync, { passive: true })
    window.addEventListener("resize", sync)
    return () => {
      window.removeEventListener("scroll", sync)
      window.removeEventListener("resize", sync)
    }
  }, [targetId])

  return (
    <div className="sticky top-14 z-30 -mx-4 border-b border-border bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex h-12 items-center gap-2 px-2">
        <Link
          href="/blog"
          aria-label="Блог руу буцах"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-foreground">
          {title}
        </p>
        <SaveHeart
          itemType="post"
          itemId={postId}
          icon="bookmark"
          className="h-9 w-9 shrink-0 bg-transparent shadow-none"
        />
      </div>
      <div className="h-0.5 w-full bg-border/60" aria-hidden>
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}
