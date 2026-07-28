"use client"

import * as React from "react"
import { Check, ChevronLeft, ChevronRight, Loader2, Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  MONTH_LABEL,
  SHIFT_SLOTS,
  WEEKDAYS,
  addDays,
  fromDateKey,
  isSlotBookable,
  isoWeekday,
  summariseDays,
  toDateKey,
  type CapacityBand,
  type ShiftSlot,
  type SlotAvailability,
} from "@/lib/drivers/shifts"

interface AvailabilityPickerProps {
  date: string
  slot: ShiftSlot | null
  onChange: (next: { date: string; slot: ShiftSlot | null }) => void
  /** Rendered under the slot list — the flight number / landing time fields. */
  children?: React.ReactNode
  className?: string
}

const BAND_LABEL: Record<CapacityBand, string> = {
  plenty: "Хангалттай",
  scarce: "Цөөхөн үлдсэн",
  full: "Дүүрэн",
  none: "Хаалттай",
}

function monthGrid(anchor: string): string[] {
  const d = fromDateKey(anchor)
  const first = toDateKey(new Date(d.getFullYear(), d.getMonth(), 1))
  const start = addDays(first, -(isoWeekday(first) - 1))
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/**
 * "Нээлттэй огноо" — the traveler's half of the shift model.
 *
 * What is shown is a vehicle count, never a driver. That is not only a privacy
 * choice: the driver is not decided until payment clears (`claim_driver_slot`),
 * so naming one here would be a guess the system would then have to honour or
 * walk back. "6 машин" is both all the traveler needs and the only thing that
 * is actually true at this point.
 *
 * A sold-out day stays visible and greyed rather than disappearing, because
 * "everything is taken on the 8th" and "nobody works the 8th" lead to different
 * decisions — and the second one is not usually why a day is unavailable.
 */
export function AvailabilityPicker({
  date,
  slot,
  onChange,
  children,
  className,
}: AvailabilityPickerProps) {
  const today = React.useMemo(() => toDateKey(new Date()), [])
  const [anchor, setAnchor] = React.useState(date || today)
  const [rows, setRows] = React.useState<SlotAvailability[]>([])
  const [loading, setLoading] = React.useState(true)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    const grid = monthGrid(anchor)
    const from = grid[0] < today ? today : grid[0]
    const to = grid[grid.length - 1]
    const controller = new AbortController()

    setLoading(true)
    fetch(`/api/transfer/availability?from=${from}&to=${to}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((json) => {
        setRows(json.slots ?? [])
        setFailed(false)
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setFailed(true)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [anchor, today])

  const byDate = React.useMemo(() => summariseDays(rows), [rows])
  const grid = React.useMemo(() => monthGrid(anchor), [anchor])
  const anchorMonth = fromDateKey(anchor).getMonth()
  const selectedDay = byDate.get(date)

  function pickDate(next: string) {
    const day = byDate.get(next)
    // Carry the slot over when the new day also has it free, so someone
    // comparing Tuesday and Wednesday mornings does not re-pick each time.
    const keep =
      slot &&
      day &&
      isSlotBookable(day.bySlot[slot], { date: next, slot })
    onChange({ date: next, slot: keep ? slot : null })
  }

  return (
    <div className={cn("space-y-3.5", className)}>
      <section className="rounded-2xl border border-border bg-card p-4">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[14.5px] font-bold text-foreground">
            {fromDateKey(anchor).getFullYear()} · {MONTH_LABEL(anchorMonth + 1)}
          </h3>
          <div className="flex items-center gap-1">
            {loading && <Loader2 className="mr-1 size-3.5 animate-spin text-muted-foreground" />}
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
          {grid.map((cell) => {
            const inMonth = fromDateKey(cell).getMonth() === anchorMonth
            const past = cell < today
            const day = byDate.get(cell)
            const band = day?.band ?? "none"
            const selected = cell === date
            const disabled = past || band === "none" || band === "full"

            return (
              <button
                key={cell}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={`${cell} — ${
                  day ? `${day.vehiclesLeft} машин` : "нээлттэй машин алга"
                }`}
                onClick={() => pickDate(cell)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-[10px] text-[13px] font-bold transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : disabled
                      ? "text-muted-foreground/50"
                      : band === "scarce"
                        ? "text-saffron-600 hover:bg-saffron-50"
                        : "text-foreground hover:bg-secondary",
                  !inMonth && "opacity-30",
                  disabled && "cursor-not-allowed"
                )}
              >
                {fromDateKey(cell).getDate()}
                <span
                  className={cn(
                    "text-[9.5px] font-semibold leading-tight",
                    selected ? "text-white/80" : "text-muted-foreground"
                  )}
                >
                  {past ? "" : band === "full" ? "дүүрэн" : day ? `${day.vehiclesLeft}` : ""}
                </span>
              </button>
            )
          })}
        </div>

        <ul className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />Сонгосон
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-foreground/70" />Хангалттай
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-saffron" />Цөөхөн үлдсэн
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-border" />Дүүрэн
          </li>
        </ul>

        {failed && (
          <p className="mt-2 text-[11.5px] font-semibold text-destructive">
            Нээлттэй огноог ачаалж чадсангүй. Хуудсаа шинэчилнэ үү.
          </p>
        )}
        {!loading && !failed && byDate.size === 0 && (
          <p className="mt-2 text-[11.5px] text-muted-foreground">
            Энэ сард нээлттэй ээлж алга. Өөр сар сонгоно уу.
          </p>
        )}
      </section>

      {/* slots */}
      <section>
        <h3 className="text-eyebrow mb-2 text-[11px]">
          Ээлж{date && ` · ${fromDateKey(date).getDate()}`}
        </h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {SHIFT_SLOTS.map((meta) => {
            const capacity = selectedDay?.bySlot[meta.id]
            const bookable = Boolean(
              date && isSlotBookable(capacity, { date, slot: meta.id })
            )
            const selected = slot === meta.id
            const band = capacity?.band ?? "none"

            return (
              <button
                key={meta.id}
                type="button"
                disabled={!bookable}
                aria-pressed={selected}
                onClick={() => onChange({ date, slot: meta.id })}
                className={cn(
                  "rounded-well border p-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-secondary"
                    : bookable
                      ? "border-border bg-card hover:border-primary/50"
                      : "cursor-not-allowed border-border bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <b
                    className={cn(
                      "text-[13px]",
                      bookable ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {meta.label}
                  </b>
                  {selected && <Check className="size-4 shrink-0 text-primary" strokeWidth={3} />}
                </div>
                <div className="text-[11.5px] text-muted-foreground">{meta.range}</div>
                <div
                  className={cn(
                    "mt-1 text-[11.5px] font-semibold",
                    band === "scarce"
                      ? "text-saffron-600"
                      : band === "plenty"
                        ? "text-success"
                        : "text-muted-foreground"
                  )}
                >
                  {capacity && capacity.open > 0
                    ? band === "full"
                      ? BAND_LABEL.full
                      : `${capacity.left} машин ${band === "scarce" ? "үлдсэн" : "боломжтой"}`
                    : BAND_LABEL.none}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {children}

      <p className="flex gap-2 rounded-well bg-success/5 p-3 text-[12.5px] leading-relaxed text-success">
        <Check className="mt-0.5 size-4 shrink-0" strokeWidth={3} />
        <span>
          <b>Хүлээх шаардлагагүй.</b> Энэ ээлжийг жолооч урьдчилж нээсэн тул төлмөгц
          баталгаажна.
        </span>
      </p>
      <p className="flex gap-2 rounded-well bg-muted p-3 text-[12px] leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Жолоочийн нэр, утас, улсын дугаар авахаас 2 цагийн өмнө нээгдэнэ — эцсийн
          хуваарилалт гарсны дараа л зөв мэдээлэл харагдана.
        </span>
      </p>
    </div>
  )
}
