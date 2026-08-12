"use client"

import { useEffect } from "react"
import { ArrowRight, RotateCw } from "lucide-react"
import Link from "next/link"

/**
 * Route-level error boundary. Catches render and data errors anywhere under
 * `[locale]` and shows a branded recovery screen instead of Next's default.
 *
 * Copy is hardcoded Mongolian on purpose: this component renders precisely
 * when something upstream has already failed, and reaching for translation
 * messages here risks the error page throwing its own error. The site ships a
 * single locale, so nothing is lost.
 *
 * Uses `next/link` rather than the i18n `Link` for the same reason — no
 * dependency on routing context that may itself be the thing that broke.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaces in Vercel's function logs. `digest` is the only handle you get
    // on a production stack trace, so log it alongside the message.
    console.error("[route error]", error.digest ?? "(no digest)", error)
  }, [error])

  return (
    <main className="mx-auto flex max-w-content flex-col items-start px-4 py-20 md:px-8 md:py-28">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Алдаа гарлаа
      </span>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
        Уучлаарай, ямар нэг зүйл буруу боллоо
      </h1>
      <p className="mt-4 max-w-prose text-lg text-muted-foreground">
        Түр зуурын алдаа байж магадгүй. Дахин оролдоод үзээрэй — давтагдвал
        бидэнд мэдэгдээрэй.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-saffron-600"
        >
          <RotateCw className="size-4" strokeWidth={2.4} /> Дахин оролдох
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Нүүр хуудас руу <ArrowRight className="size-4" strokeWidth={2.2} />
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-2 py-3 text-[15px] font-semibold text-primary underline-offset-4 hover:underline"
        >
          Холбоо барих
        </Link>
      </div>

      {error.digest && (
        <p className="mt-10 text-sm text-muted-foreground">
          Алдааны код:{" "}
          <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">
            {error.digest}
          </code>
        </p>
      )}
    </main>
  )
}
