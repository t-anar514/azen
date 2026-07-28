"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CalendarPlus, Coffee, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  MONTH_LABEL,
  fromDateKey,
  previewOpenWeeks,
  templateKey,
  type ShiftRow,
  type ShiftSlot,
} from "@/lib/drivers/shifts"
import type { DriverRow, DriverShiftTemplateRow } from "@/lib/supabase/types"
import { WeeklyTemplateEditor, type TemplatePrefs } from "./WeeklyTemplateEditor"
import { ScheduleCalendar, type DayJob } from "./ScheduleCalendar"

export interface DriverScheduleStats {
  jobsThisWeek: number
  hoursThisWeek: number
  openSlots: number
  bookedSlots: number
  monthEarnings: number
  rating: number | null
  tripCount: number
}

interface DriverScheduleScreenProps {
  driver: DriverRow
  today: string
  template: DriverShiftTemplateRow[]
  shifts: ShiftRow[]
  jobs: DayJob[]
  stats: DriverScheduleStats
}

const WEEKS_TO_OPEN = 4

function formatDate(dateKey: string): string {
  const d = fromDateKey(dateKey)
  return `${MONTH_LABEL(d.getMonth() + 1)}ын ${d.getDate()}`
}

const togrog = new Intl.NumberFormat("mn-MN")

export function DriverScheduleScreen({
  driver,
  today,
  template,
  shifts: initialShifts,
  jobs,
  stats,
}: DriverScheduleScreenProps) {
  const router = useRouter()
  const [shifts, setShifts] = React.useState(initialShifts)
  const [templateOpen, setTemplateOpen] = React.useState(
    () => new Set(template.map((t) => templateKey(t.weekday, t.slot as ShiftSlot)))
  )
  const [opening, setOpening] = React.useState(false)
  const [notice, setNotice] = React.useState<string | null>(null)

  // The server's copy is authoritative after any router.refresh().
  React.useEffect(() => setShifts(initialShifts), [initialShifts])

  const prefs: TemplatePrefs = {
    minNoticeHours: driver.min_notice_hours,
    maxJobsPerDay: driver.max_jobs_per_day,
    autoExtend: driver.schedule_auto_extend,
  }

  const preview = React.useMemo(
    () =>
      previewOpenWeeks(
        Array.from(templateOpen).map((key) => {
          const [weekday, slot] = key.split(":")
          return { weekday: Number(weekday), slot: slot as ShiftSlot }
        }),
        today,
        WEEKS_TO_OPEN
      ),
    [templateOpen, today]
  )

  async function openWeeks() {
    setOpening(true)
    setNotice(null)
    const res = await fetch("/api/driver/schedule/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeks: WEEKS_TO_OPEN }),
    })
    setOpening(false)

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      setNotice(payload?.error ?? "Нээж чадсангүй. Дахин оролдоно уу.")
      return
    }
    const { openUntil } = await res.json()
    setNotice(`${formatDate(openUntil)} хүртэл нээгдлээ.`)
    router.refresh()
  }

  const openUntil = driver.schedule_open_until

  return (
    <div className="space-y-3.5 px-4 py-5 md:px-8 md:py-8">
      {/* greeting */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-[27px]">
            Сайн уу, {driver.full_name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Энэ 7 хоногт <b className="text-foreground">{stats.jobsThisWeek} ажил</b>
            {stats.hoursThisWeek > 0 && ` · ${stats.hoursThisWeek} цаг`}.{" "}
            {openUntil ? (
              <>
                Таны хуваарь <b className="text-foreground">{formatDate(openUntil)}</b> хүртэл
                нээлттэй.
              </>
            ) : (
              <b className="text-saffron-600">Хуваарь хараахан нээгээгүй байна.</b>
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" disabled>
            <Coffee className="size-4" /> Түр амрах
          </Button>
          <Button variant="reserve" onClick={openWeeks} disabled={opening}>
            {opening ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CalendarPlus className="size-4" />
            )}
            {WEEKS_TO_OPEN} долоо хоног нээх
          </Button>
        </div>
      </header>

      {notice && (
        <p className="rounded-well bg-secondary px-3 py-2 text-[12.5px] font-semibold text-primary">
          {notice}
        </p>
      )}
      {templateOpen.size > 0 && (
        <p className="text-[12px] text-muted-foreground">
          Дарвал <b className="text-foreground">{preview.slots} ээлж</b> ({preview.dates.length}{" "}
          өдөр) {formatDate(preview.through)} хүртэл нээгдэнэ.
        </p>
      )}

      {/* KPIs */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Энэ 7 хоногийн ажил"
          value={String(stats.jobsThisWeek)}
          foot={`${stats.hoursThisWeek} цаг`}
        />
        <Kpi
          label="Нээлттэй ээлж"
          value={String(stats.openSlots)}
          foot={`${stats.bookedSlots} нь захиалагдсан`}
          footTone="success"
        />
        <Kpi
          label="Энэ сарын орлого"
          value={`₮${togrog.format(stats.monthEarnings)}`}
          foot="7 хоног тутам төлөгдөнө"
        />
        <Kpi
          label="Үнэлгээ"
          value={stats.rating === null ? "—" : stats.rating.toFixed(1)}
          foot={`${stats.tripCount} аялал`}
        />
      </div>

      <WeeklyTemplateEditor
        initialOpen={templateOpen}
        initialPrefs={prefs}
        onSaved={setTemplateOpen}
      />

      <ScheduleCalendar
        today={today}
        shifts={shifts}
        jobs={jobs}
        onShiftsChange={setShifts}
      />

      {/* upcoming jobs */}
      <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <header className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-[15.5px] font-bold text-foreground">Ойрын ажлууд</h2>
          <span className="rounded-pill bg-success/10 px-2 py-0.5 text-[10.5px] font-bold text-success">
            Зөвшөөрөх шаардлагагүй
          </span>
        </header>

        {jobs.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            Одоогоор захиалга алга. Ээлжээ нээвэл энд харагдана.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {jobs.slice(0, 6).map((job) => (
              <li
                key={job.id}
                className="grid gap-1 py-3 sm:grid-cols-[130px_1fr_auto] sm:items-center sm:gap-3"
              >
                <div>
                  <b className="text-[13px] text-foreground">
                    {formatDate(job.date)} · {job.time}
                  </b>
                  <div className="text-[11.5px] text-muted-foreground">{job.subtitle}</div>
                </div>
                <div className="text-[13px] text-foreground">{job.title}</div>
                <div className="text-[13px] font-bold text-foreground sm:text-right">
                  {job.price}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Kpi({
  label,
  value,
  foot,
  footTone,
}: {
  label: string
  value: string
  foot: string
  footTone?: "success"
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-[26px] font-extrabold text-foreground">{value}</div>
      <p
        className={cn(
          "text-[11.5px]",
          footTone === "success" ? "font-semibold text-success" : "text-muted-foreground"
        )}
      >
        {foot}
      </p>
    </article>
  )
}
