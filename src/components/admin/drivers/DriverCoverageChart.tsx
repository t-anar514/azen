import { cn } from "@/lib/utils"
import { fromDateKey } from "@/lib/drivers/shifts"
import type { ShiftCoverageRow } from "@/lib/supabase/types"

/** Below this many vehicles a day is drawn in the alarm colour. */
export const SHORTFALL_THRESHOLD = 4

interface DriverCoverageChartProps {
  days: ShiftCoverageRow[]
}

function axisLabel(date: string, index: number): string {
  const d = fromDateKey(date)
  const day = String(d.getDate()).padStart(2, "0")
  // Only the first bar and the first of each month carry the month, so the axis
  // reads "7/27 28 29 30 31 8/01 02" rather than repeating it fourteen times.
  return index === 0 || d.getDate() === 1 ? `${d.getMonth() + 1}/${day}` : day
}

/**
 * Fourteen stacked bars: booked on top of still-open, per day.
 *
 * A day nobody opened is not omitted — it is drawn as an empty grey stub. The
 * gap is the single thing this chart exists to surface ("аялагч огноогоор
 * захиалдаг тул сул өдөр = алдсан орлого"), so it has to occupy space.
 */
export function DriverCoverageChart({ days }: DriverCoverageChartProps) {
  const peak = Math.max(1, ...days.map((d) => d.vehicles_open))

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[15.5px] font-bold text-foreground">
            Ирэх 14 хоногийн хүчин чадал
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Нээлттэй ээлж бүхий жолоочийн тоо · өдөр тутмын багтаамж
          </p>
        </div>
        <ul className="flex gap-3.5 text-[11.5px] text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-primary" aria-hidden />Нээлттэй
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-saffron" aria-hidden />Захиалагдсан
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-destructive" aria-hidden />Дутагдалтай
          </li>
        </ul>
      </div>

      <div className="grid h-[132px] grid-cols-14 items-end gap-1.5 sm:gap-2">
        {days.map((day) => {
          const short = day.vehicles_open > 0 && day.vehicles_open < SHORTFALL_THRESHOLD
          const empty = day.vehicles_open === 0
          const free = Math.max(day.vehicles_open - day.vehicles_booked, 0)

          return (
            <div key={day.date} className="flex h-full flex-col justify-end gap-1">
              <span
                className={cn(
                  "text-center font-display text-xs font-extrabold",
                  empty ? "text-muted-foreground" : short ? "text-destructive" : "text-foreground/80"
                )}
              >
                {day.vehicles_open}
              </span>
              {empty ? (
                <span className="block h-[9%] rounded-t-[5px] bg-muted" aria-hidden />
              ) : (
                <>
                  {day.vehicles_booked > 0 && (
                    <span
                      className="block rounded-t-[5px] bg-saffron"
                      style={{ height: `${(day.vehicles_booked / peak) * 62}%` }}
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      day.vehicles_booked > 0 ? "" : "rounded-t-[5px]",
                      short ? "bg-destructive" : "bg-primary",
                      "block"
                    )}
                    style={{ height: `${Math.max((free / peak) * 62, 4)}%` }}
                    aria-hidden
                  />
                </>
              )}
              <span className="sr-only">
                {day.date}: {day.vehicles_open} машин нээлттэй, {day.vehicles_booked} захиалагдсан
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-2 grid grid-cols-14 gap-1.5 border-t border-muted pt-2 text-center text-[11px] text-muted-foreground sm:gap-2">
        {days.map((day, i) => (
          <span
            key={day.date}
            className={cn(
              day.vehicles_open > 0 && day.vehicles_open < SHORTFALL_THRESHOLD &&
                "font-bold text-destructive"
            )}
          >
            {axisLabel(day.date, i)}
          </span>
        ))}
      </div>
    </section>
  )
}
