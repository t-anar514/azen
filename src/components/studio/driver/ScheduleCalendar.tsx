"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  MONTH_LABEL,
  SHIFT_SLOTS,
  WEEKDAYS,
  addDays,
  fromDateKey,
  indexShifts,
  isoWeekday,
  resolveSlotState,
  toDateKey,
  type ShiftRow,
  type ShiftSlot,
} from "@/lib/drivers/shifts"

export interface DayJob {
  id: string
  date: string
  slot: ShiftSlot | null
  time: string
  title: string
  subtitle: string
  price: string
}

interface ScheduleCalendarProps {
  today: string
  shifts: ShiftRow[]
  jobs: DayJob[]
  onShiftsChange: (next: ShiftRow[]) => void
}

/** Builds the 6×7 grid of a month, padded to whole weeks starting Monday. */
function monthGrid(anchor: string): string[] {
  const d = fromDateKey(anchor)
  const first = toDateKey(new Date(d.getFullYear(), d.getMonth(), 1))
  const start = addDays(first, -(isoWeekday(first) - 1))
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

function formatDayTitle(date: string): string {
  const d = fromDateKey(date)
  const weekday = WEEKDAYS[isoWeekday(date) - 1]
  return `${MONTH_LABEL(d.getMonth() + 1)}ын ${d.getDate()}, ${weekday.long}`
}

/**
 * Month grid plus the panel for whichever day is selected.
 *
 * Every mutation is optimistic and reverted on failure. A driver toggling their
 * Tuesday evening does not want to watch a spinner for a change that is one
 * row; but a toggle that silently didn't stick would leave them believing they
 * are bookable when they are not, so a failure has to visibly bounce back.
 */
export function ScheduleCalendar({
  today,
  shifts,
  jobs,
  onShiftsChange,
}: ScheduleCalendarProps) {
  const [anchor, setAnchor] = React.useState(today)
  const [selected, setSelected] = React.useState(today)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const byKey = React.useMemo(() => indexShifts(shifts), [shifts])
  const grid = React.useMemo(() => monthGrid(anchor), [anchor])
  const anchorMonth = fromDateKey(anchor).getMonth()

  const jobsByDate = React.useMemo(() => {
    const map = new Map<string, DayJob[]>()
    for (const job of jobs) {
      const list = map.get(job.date)
      if (list) list.push(job)
      else map.set(job.date, [job])
    }
    return map
  }, [jobs])

  const selectedJobs = jobsByDate.get(selected) ?? []
  const selectedOpenCount = SHIFT_SLOTS.filter((s) =>
    byKey.has(`${selected}:${s.id}`)
  ).length

  /** Applies one slot change to a shift list without mutating it. */
  function withSlot(rows: ShiftRow[], date: string, slot: ShiftSlot, open: boolean): ShiftRow[] {
    const without = rows.filter((s) => !(s.date === date && s.slot === slot))
    return open ? [...without, { date, slot, capacity: 1, booked_count: 0 }] : without
  }

  async function setSlot(date: string, slot: ShiftSlot, open: boolean) {
    const key = `${date}:${slot}`
    setBusy(key)
    setError(null)

    const previous = shifts
    onShiftsChange(withSlot(shifts, date, slot, open))

    const res = await fetch("/api/driver/schedule/day", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, slot, open }),
    })
    setBusy(null)

    if (!res.ok) {
      onShiftsChange(previous)
      const payload = await res.json().catch(() => null)
      setError(payload?.error ?? "Хадгалж чадсангүй.")
    }
  }

  /**
   * "Өдрийг хаах" — closes every unsold slot on the day at once.
   *
   * The optimistic list is computed for all of them up front rather than by
   * calling setSlot in a loop: each of those calls would derive its next state
   * from the `shifts` prop captured in this render, so the second one would
   * quietly resurrect the slot the first had just removed.
   */
  async function closeDay(date: string) {
    const closable = SHIFT_SLOTS.map((s) => byKey.get(`${date}:${s.id}`)).filter(
      (row): row is ShiftRow => row !== undefined && row.booked_count === 0
    )
    if (closable.length === 0) return

    const previous = shifts
    setError(null)
    onShiftsChange(
      shifts.filter(
        (s) => !(s.date === date && closable.some((c) => c.slot === s.slot))
      )
    )

    const results = await Promise.all(
      closable.map((row) =>
        fetch("/api/driver/schedule/day", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, slot: row.slot, open: false }),
        })
      )
    )

    if (results.some((r) => !r.ok)) {
      onShiftsChange(previous)
      setError("Зарим ээлжийг хааж чадсангүй.")
    }
  }

  return (
    <div className="grid gap-3.5 lg:grid-cols-[1fr_320px]">
      {/* month */}
      <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[15.5px] font-bold text-foreground">
            {fromDateKey(anchor).getFullYear()} · {MONTH_LABEL(anchorMonth + 1)}
          </h2>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Өмнөх сар"
              onClick={() => setAnchor((a) => addDays(a, -28))}
              className="flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Дараах сар"
              onClick={() => setAnchor((a) => addDays(a, 28))}
              className="flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <span key={d.iso}>{d.short}</span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((date) => {
            const inMonth = fromDateKey(date).getMonth() === anchorMonth
            const past = date < today
            const open = SHIFT_SLOTS.filter((s) => byKey.get(`${date}:${s.id}`))
            const booked = open.filter((s) => (byKey.get(`${date}:${s.id}`)?.booked_count ?? 0) > 0)
            const isSelected = date === selected

            return (
              <button
                key={date}
                type="button"
                disabled={past}
                aria-pressed={isSelected}
                onClick={() => setSelected(date)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 rounded-[10px] text-[13px] font-semibold transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : open.length > 0
                      ? "bg-secondary text-secondary-foreground hover:bg-sky-200/60"
                      : "text-foreground hover:bg-muted",
                  !inMonth && "opacity-35",
                  past && "cursor-not-allowed text-muted-foreground opacity-40 hover:bg-transparent"
                )}
              >
                {fromDateKey(date).getDate()}
                <span className="flex h-1.5 gap-[2px]">
                  {open.map((s) => (
                    <span
                      key={s.id}
                      className={cn(
                        "size-1.5 rounded-full",
                        booked.some((b) => b.id === s.id)
                          ? "bg-saffron"
                          : isSelected
                            ? "bg-white/80"
                            : "bg-primary"
                      )}
                    />
                  ))}
                </span>
              </button>
            )
          })}
        </div>

        <ul className="mt-3 flex flex-wrap gap-3.5 border-t border-border pt-3 text-[11.5px] text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />Нээлттэй ээлж
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-saffron" />Захиалагдсан
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted" />Нээгээгүй
          </li>
        </ul>
      </section>

      {/* day panel */}
      <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <header className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-[14.5px] font-bold text-foreground">
              {formatDayTitle(selected)}
            </h3>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              {selectedOpenCount} ээлж нээлттэй · {selectedJobs.length} ажил
            </p>
          </div>
          {selectedOpenCount > 0 && selected >= today && (
            <button
              type="button"
              onClick={() => closeDay(selected)}
              className="shrink-0 text-[11.5px] font-bold text-destructive hover:underline"
            >
              Өдрийг хаах
            </button>
          )}
        </header>

        {selectedJobs.map((job) => (
          <article
            key={job.id}
            className="mb-2.5 flex gap-2.5 rounded-well border border-saffron/30 bg-saffron-50/60 p-2.5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-saffron text-white">
              <Lock className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <b className="text-[12.5px] text-foreground">
                  {job.time} · {job.title}
                </b>
                <span className="rounded-pill bg-success/10 px-1.5 py-0.5 text-[10px] font-bold text-success">
                  Автоматаар оноогдсон
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                {job.subtitle} · {job.price}
              </p>
            </div>
          </article>
        ))}

        <div className="flex flex-col gap-2">
          {SHIFT_SLOTS.map((slot) => {
            const row = byKey.get(`${selected}:${slot.id}`)
            const state = resolveSlotState(row)
            const key = `${selected}:${slot.id}`
            const locked = state === "booked"
            const past = selected < today

            return (
              <div
                key={slot.id}
                className={cn(
                  "flex items-center gap-3 rounded-well border p-3",
                  state === "closed" ? "border-border bg-muted/30" : "border-border bg-card"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-foreground">
                    {slot.label} · {slot.range}
                  </div>
                  <div
                    className={cn(
                      "text-[11.5px]",
                      state === "booked"
                        ? "font-semibold text-saffron-600"
                        : state === "open"
                          ? "text-success"
                          : "text-muted-foreground"
                    )}
                  >
                    {state === "booked"
                      ? "Захиалагдсан — түгжээтэй"
                      : state === "open"
                        ? "Нээлттэй — захиалга хүлээж байна"
                        : "Хаалттай"}
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={state !== "closed"}
                  aria-label={`${slot.label} ээлж`}
                  disabled={locked || past || busy === key}
                  onClick={() => setSlot(selected, slot.id, state === "closed")}
                  className={cn(
                    "relative h-[24px] w-11 shrink-0 rounded-pill transition-colors",
                    state === "closed" ? "bg-muted" : "bg-primary",
                    (locked || past) && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-[3px] size-[18px] rounded-full bg-white shadow transition-all",
                      state === "closed" ? "left-[3px]" : "left-[23px]"
                    )}
                  />
                </button>
              </div>
            )
          })}
        </div>

        {error && (
          <p className="mt-2.5 text-[11.5px] font-semibold text-destructive">{error}</p>
        )}
      </section>
    </div>
  )
}
