"use client"

import * as React from "react"
import { mn } from "date-fns/locale"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  MAX_MONTHS_AHEAD,
  resolveDayState,
  toDateKey,
} from "@/lib/guides/availability"

const SWATCH = {
  available: "bg-card border border-border",
  blocked: "bg-primary",
  booked: "bg-saffron",
  past: "bg-muted",
} as const

export function AvailabilityCalendar({
  initialBlocked,
  booked,
}: {
  initialBlocked: string[]
  booked: string[]
}) {
  const [blocked, setBlocked] = React.useState<Set<string>>(
    () => new Set(initialBlocked)
  )
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [rangeFrom, setRangeFrom] = React.useState("")
  const [rangeTo, setRangeTo] = React.useState("")

  const bookedSet = React.useMemo(() => new Set(booked), [booked])
  const today = toDateKey(new Date())
  const maxDate = React.useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + MAX_MONTHS_AHEAD)
    return d
  }, [])

  async function send(dates: string[], action: "block" | "unblock") {
    if (dates.length === 0) return
    setBusy(true)
    setError(null)

    // Optimistic — the calendar must feel instant; reverted on failure.
    const snapshot = new Set(blocked)
    const next = new Set(blocked)
    for (const d of dates) {
      if (action === "block") next.add(d)
      else next.delete(d)
    }
    setBlocked(next)

    try {
      const res = await fetch("/api/studio/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates, action }),
      })
      if (!res.ok) {
        setBlocked(snapshot)
        setError(
          res.status === 409
            ? "Захиалгатай өдрийг өөрчлөх боломжгүй."
            : "Хадгалахад алдаа гарлаа. Дахин оролдоно уу."
        )
      }
    } catch {
      setBlocked(snapshot)
      setError("Сүлжээний алдаа гарлаа.")
    } finally {
      setBusy(false)
    }
  }

  // onDayClick, not onSelect: in react-day-picker's single mode, clicking the
  // already-selected day fires onSelect with `undefined`, so a day could be
  // blocked but never unblocked by clicking it again.
  function toggle(day: Date) {
    const key = toDateKey(day)
    const state = resolveDayState(key, { today, blocked, booked: bookedSet })
    // past and booked days are not the guide's to change
    if (state === "past" || state === "booked") return
    void send([key], state === "blocked" ? "unblock" : "block")
  }

  function blockRange() {
    if (!rangeFrom || !rangeTo || rangeFrom > rangeTo) {
      setError("Огнооны мужаа зөв сонгоно уу.")
      return
    }
    const dates: string[] = []
    const cursor = new Date(`${rangeFrom}T00:00:00`)
    const end = new Date(`${rangeTo}T00:00:00`)
    while (cursor <= end) {
      const key = toDateKey(cursor)
      const state = resolveDayState(key, { today, blocked, booked: bookedSet })
      if (state === "available") dates.push(key)
      cursor.setDate(cursor.getDate() + 1)
    }
    if (dates.length === 0) {
      setError("Сонгосон мужид нээлттэй өдөр алга.")
      return
    }
    void send(dates, "block")
    setRangeFrom("")
    setRangeTo("")
  }

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-border bg-card p-4">
        <Calendar
          mode="single"
          onDayClick={toggle}
          locale={mn}
          weekStartsOn={1}
          // Sold days are disabled, not merely ignored on click — a day that
          // looks tappable but silently does nothing reads as a broken UI.
          disabled={(day: Date) => {
            if (day > maxDate) return true
            const s = resolveDayState(toDateKey(day), {
              today,
              blocked,
              booked: bookedSet,
            })
            return s === "past" || s === "booked"
          }}
          formatters={{
            formatCaption: (month: Date) =>
              `${month.getFullYear()} · ${month.getMonth() + 1}-р сар`,
          }}
          modifiers={{
            blocked: (d: Date) => blocked.has(toDateKey(d)),
            booked: (d: Date) => bookedSet.has(toDateKey(d)),
          }}
          modifiersClassNames={{
            blocked: "bg-primary text-white rounded-md",
            booked: "bg-saffron text-white rounded-md",
          }}
          className="w-full"
        />

        <div className="mt-3 flex flex-wrap gap-4 text-[11.5px] text-muted-foreground">
          {(
            [
              ["available", "Боломжтой"],
              ["blocked", "Хаасан"],
              ["booked", "Захиалгатай"],
              ["past", "Өнгөрсөн"],
            ] as const
          ).map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-[3px]", SWATCH[key])} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Хугацаа хаах
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            aria-label="Эхлэх өдөр"
            value={rangeFrom}
            min={today}
            onChange={(e) => setRangeFrom(e.target.value)}
            className="rounded-well border border-border bg-card px-2.5 py-1.5 text-[13px]"
          />
          <span className="text-muted-foreground">→</span>
          <input
            type="date"
            aria-label="Дуусах өдөр"
            value={rangeTo}
            min={rangeFrom || today}
            onChange={(e) => setRangeTo(e.target.value)}
            className="rounded-well border border-border bg-card px-2.5 py-1.5 text-[13px]"
          />
          <Button variant="message" size="sm" onClick={blockRange} disabled={busy}>
            Хаах
          </Button>
        </div>
        <p className="mt-2 text-[11.5px] text-muted-foreground">
          Амралт, аялалд явах өдрүүдээ нэг дор хаана.
        </p>
      </div>

      {error && <p className="text-[12.5px] text-destructive">{error}</p>}
    </div>
  )
}
