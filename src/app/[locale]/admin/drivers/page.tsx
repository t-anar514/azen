import { AlertTriangle, Plus, SlidersHorizontal } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  COVERAGE_DAYS,
  loadCoverage,
  todayKey,
} from "@/lib/drivers/scheduleData"
import {
  addDays,
  driverStatus,
  fromDateKey,
  openDayCount,
  startOfWeek,
  weekStrip,
  type ShiftRow,
} from "@/lib/drivers/shifts"
import {
  DriverCoverageChart,
  SHORTFALL_THRESHOLD,
} from "@/components/admin/drivers/DriverCoverageChart"
import { DriversTable, type DriverListItem } from "@/components/admin/drivers/DriversTable"
import type { DriverRow } from "@/lib/supabase/types"

export const metadata = { title: "Жолооч | Azen Admin" }

// The page is a live capacity read; caching it would show yesterday's gaps.
export const dynamic = "force-dynamic"

const DOC_FIELDS = ["id_document_url", "license_document_url", "vehicle_document_url"] as const

interface TripStat {
  rating: number | null
  trips: number
}

/**
 * One round-trip for drivers, one for their shifts, one for trip counts.
 *
 * The shifts read covers only the week the table's strip renders, not the whole
 * coverage window — the 14-day chart is served by an aggregate in the database
 * (`driver_shift_coverage`) precisely so this page does not have to pull every
 * driver's every row into Node to add them up.
 */
async function loadDrivers(weekStart: string): Promise<{
  items: DriverListItem[]
  drivers: DriverRow[]
}> {
  const supabase = await createClient()
  const weekEnd = addDays(weekStart, 6)

  const [{ data: driverRows }, { data: shiftRows }, { data: bookingRows }] = await Promise.all([
    supabase.from("drivers").select("*").order("created_at", { ascending: false }),
    supabase
      .from("driver_shifts")
      .select("driver_id, date, slot, capacity, booked_count")
      .gte("date", weekStart)
      .lte("date", weekEnd),
    supabase
      .from("bookings")
      .select("driver_id, status")
      .not("driver_id", "is", null)
      .eq("status", "completed"),
  ])

  const drivers = (driverRows ?? []) as DriverRow[]

  const shiftsByDriver = new Map<string, ShiftRow[]>()
  for (const row of (shiftRows ?? []) as (ShiftRow & { driver_id: string })[]) {
    const list = shiftsByDriver.get(row.driver_id)
    if (list) list.push(row)
    else shiftsByDriver.set(row.driver_id, [row])
  }

  const trips = new Map<string, TripStat>()
  for (const b of (bookingRows ?? []) as { driver_id: string }[]) {
    const stat = trips.get(b.driver_id)
    if (stat) stat.trips++
    else trips.set(b.driver_id, { rating: null, trips: 1 })
  }

  const items: DriverListItem[] = drivers.map((driver) => {
    const shifts = shiftsByDriver.get(driver.id) ?? []
    const stat = trips.get(driver.id)
    return {
      driver,
      week: weekStrip(shifts, weekStart),
      openDays: openDayCount(shifts, weekStart, 7),
      docsPresent: DOC_FIELDS.filter((f) => driver[f]).length,
      docsTotal: DOC_FIELDS.length,
      rating: stat?.rating ?? null,
      tripCount: stat?.trips ?? 0,
    }
  })

  return { items, drivers }
}

export default async function AdminDriversPage() {
  const today = todayKey()
  const weekStart = startOfWeek(today)

  const [{ items, drivers }, coverage] = await Promise.all([
    loadDrivers(weekStart),
    loadCoverage(today, COVERAGE_DAYS),
  ])

  const pending = drivers.filter((d) => d.verification_status === "pending")
  const approved = drivers.filter((d) => d.verification_status === "approved")
  const scheduled = approved.filter(
    (d) => driverStatus(d, today) === "active" || driverStatus(d, today) === "expiring"
  )

  // "Хамрал" is the share of the next 14 days that has any cover at all —
  // a percentage of days, not of vehicles, because one uncovered day is a
  // closed shop regardless of how well staffed the other thirteen are.
  const coveredDays = coverage.filter((c) => c.vehicles_open > 0).length
  const coveragePct = Math.round((coveredDays / Math.max(coverage.length, 1)) * 100)

  const shortDays = coverage.filter((c) => c.vehicles_open < SHORTFALL_THRESHOLD)
  const oldestPending = pending.reduce<string | null>(
    (oldest, d) => (!oldest || d.created_at < oldest ? d.created_at : oldest),
    null
  )
  // Derived from `today` rather than a fresh clock read so this render is a
  // pure function of its inputs — and so the number cannot disagree with the
  // 14-day window computed from the same key just above.
  const oldestPendingDays = oldestPending
    ? Math.max(
        0,
        Math.round(
          (fromDateKey(today).getTime() - fromDateKey(oldestPending.slice(0, 10)).getTime()) /
            86_400_000
        )
      )
    : 0

  return (
    <div className="space-y-4 md:space-y-[18px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-[26px]">
            Жолооч
          </h1>
          <p className="mt-1 max-w-xl text-[13.5px] text-muted-foreground">
            Өргөдөл шалгах, эрх олгох, ирэх 14 хоногийн хүчин чадлыг хянах. Жолооч бүр
            өөрөө хуваариа нээдэг — админ зөвхөн цоорхойг хардаг.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline">
            <SlidersHorizontal className="size-4" /> Хуваарийн бодлого
          </Button>
          <Button>
            <Plus className="size-4" /> Жолооч урих
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Хүлээгдэж буй өргөдөл
            </span>
            {pending.length > 0 && <span className="size-[7px] rounded-full bg-saffron" />}
          </div>
          <div className="mt-1 font-display text-[28px] font-extrabold text-saffron-600">
            {pending.length}
          </div>
          <p className="text-[11.5px] text-muted-foreground">
            {pending.length > 0
              ? `хамгийн эртний нь ${oldestPendingDays} хоногтой`
              : "шинэ өргөдөл алга"}
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-semibold text-muted-foreground">Идэвхтэй жолооч</span>
          <div className="mt-1 font-display text-[28px] font-extrabold text-foreground">
            {approved.length}
          </div>
          <p className="text-[11.5px] font-semibold text-success">
            {scheduled.length} нь хуваарь нээсэн
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-semibold text-muted-foreground">14 хоногийн хамрал</span>
          <div className="mt-1 font-display text-[28px] font-extrabold text-foreground">
            {coveragePct}%
          </div>
          <div className="mt-2 h-[5px] overflow-hidden rounded-pill bg-muted">
            <span
              className="block h-full rounded-pill bg-success"
              style={{ width: `${coveragePct}%` }}
            />
          </div>
        </article>

        <article
          className={cn(
            "rounded-2xl border bg-card p-4",
            shortDays.length > 0 ? "border-destructive/30" : "border-border"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Нөөцгүй өдөр</span>
            {shortDays.length > 0 && <AlertTriangle className="size-4 text-destructive" />}
          </div>
          <div
            className={cn(
              "mt-1 font-display text-[28px] font-extrabold",
              shortDays.length > 0 ? "text-destructive" : "text-foreground"
            )}
          >
            {shortDays.length}
          </div>
          <p
            className={cn(
              "text-[11.5px]",
              shortDays.length > 0
                ? "font-semibold text-destructive"
                : "text-muted-foreground"
            )}
          >
            {shortDays.length > 0
              ? `${shortDays
                  .slice(0, 2)
                  .map((d) => d.date.slice(5).replace("-", "/"))
                  .join(" · ")} — сул жолооч алга`
              : "бүх өдөр хамрагдсан"}
          </p>
        </article>
      </div>

      <DriverCoverageChart days={coverage} />

      {drivers.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Одоогоор жолоочийн өргөдөл алга. /driver/apply хуудсаар ирнэ.
          </p>
        </div>
      ) : (
        <DriversTable items={items} today={today} />
      )}
    </div>
  )
}
