"use client"

import * as React from "react"
import { Lock } from "lucide-react"

/**
 * Placeholder shown between assignment and reveal.
 *
 * The important thing on this card is not the countdown, it is the sentence
 * under it. "Your driver is hidden" invites the reading that something has gone
 * wrong or that no driver exists — so the card says which of those it is: a
 * driver is assigned, and the details are held back because they can still
 * change before pickup.
 */
export function DriverLockedCard({ revealAt }: { revealAt: string }) {
  const target = React.useMemo(() => new Date(revealAt).getTime(), [revealAt])
  const [now, setNow] = React.useState<number | null>(null)

  // Started in an effect so server and first client render agree — a live clock
  // in the initial HTML is a guaranteed hydration mismatch.
  React.useEffect(() => {
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  const remaining = now === null ? null : Math.max(target - now, 0)
  const hours = remaining === null ? null : Math.floor(remaining / 3_600_000)
  const minutes = remaining === null ? null : Math.floor((remaining % 3_600_000) / 60_000)

  const at = new Date(revealAt)
  const clock = `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`
  const day = `${at.getMonth() + 1}/${String(at.getDate()).padStart(2, "0")}`

  return (
    <section className="rounded-card border border-border bg-card p-4">
      <h3 className="text-eyebrow mb-2.5 text-[11px]">Жолооч</h3>
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lock className="size-4" />
        </span>
        <p className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-muted-foreground">
          Жолоочийн мэдээлэл{" "}
          <b className="text-foreground">
            {day} {clock}
          </b>
          -д нээгдэнэ — авахаас 2 цагийн өмнө.
        </p>
        <div className="shrink-0 text-right">
          <div className="font-display text-[19px] font-extrabold tabular-nums text-foreground">
            {hours === null ? "—" : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">цаг · мин</div>
        </div>
      </div>
      <p className="mt-3 border-t border-border pt-3 text-[11.5px] text-muted-foreground">
        Яагаад одоо биш вэ? Жолооч солигдож болзошгүй — эцсийн хуваарилалт гарсны дараа л зөв
        мэдээлэл харуулна.
      </p>
    </section>
  )
}
