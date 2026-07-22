"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { GuideReviewRow } from "@/lib/supabase/types"

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("mn-MN", { dateStyle: "medium" }).format(new Date(iso))
}

function StarRow({
  value,
  size = "size-3.5",
  onPick,
}: {
  value: number
  size?: string
  onPick?: (n: number) => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) =>
        onPick ? (
          <button key={n} type="button" onClick={() => onPick(n)} aria-label={`${n} од`}>
            <Star
              className={cn(size, n <= value ? "fill-saffron-600 text-saffron-600" : "text-muted-foreground/30")}
            />
          </button>
        ) : (
          <Star
            key={n}
            className={cn(size, n <= value ? "fill-saffron-600 text-saffron-600" : "text-muted-foreground/30")}
          />
        )
      )}
    </div>
  )
}

interface GuideReviewListProps {
  reviews: GuideReviewRow[]
  guideId: string
}

/** Сэтгэгдэл tab (design doc, Screen 12): review rows + a posting form. */
export function GuideReviewList({ reviews, guideId }: GuideReviewListProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | null>(null)
  const [rating, setRating] = React.useState(5)
  const [body, setBody] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function openForm() {
    setOpen(true)
    setError(null)
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    setIsLoggedIn(!!data.user)
  }

  async function submit() {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/guides/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId, rating, body }),
      })

      if (res.status === 401) {
        setIsLoggedIn(false)
        return
      }
      if (!res.ok) {
        setError("Сэтгэгдэл илгээхэд алдаа гарлаа. Дахин оролдоно уу.")
        return
      }

      setOpen(false)
      setBody("")
      setRating(5)
      router.refresh()
    } catch {
      setError("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold">Сэтгэгдэл</h2>
        {!open && (
          <Button type="button" variant="outline" size="sm" className="rounded-pill" onClick={openForm}>
            Сэтгэгдэл үлдээх
          </Button>
        )}
      </div>

      {open && (
        <div className="space-y-3 rounded-card border border-border bg-card p-4">
          {isLoggedIn === false ? (
            <p className="text-sm text-muted-foreground">
              Сэтгэгдэл бичихийн тулд эхлээд{" "}
              <Link href="/login?redirectTo=/guides" className="font-semibold text-primary hover:underline">
                нэвтэрнэ үү
              </Link>
              .
            </p>
          ) : (
            <>
              <StarRow value={rating} size="size-5" onPick={setRating} />
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Аяллын тухай сэтгэгдлээ хуваалцаарай…"
                rows={3}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={submitting} onClick={submit}>
                  {submitting ? "Илгээж байна…" : "Илгээх"}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                  Болих
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="rounded-card border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Одоогоор сэтгэгдэл алга
        </p>
      ) : (
        <div className="divide-y divide-[#F1F5F9] rounded-card border border-border bg-card">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3 p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tint-sky text-sm font-bold text-primary">
                А
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">Аялагч</span>
                  <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                </div>
                <div className="mt-0.5">
                  <StarRow value={r.rating} />
                </div>
                {r.body && <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
