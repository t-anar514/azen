"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, MoreHorizontal, Search, Star, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn, initials } from "@/lib/utils"
import {
  DRIVER_STATUS_LABEL,
  driverStatus,
  statusTab,
  type DriverStatus,
  type SlotState,
} from "@/lib/drivers/shifts"
import type { DriverRow } from "@/lib/supabase/types"
import { DriverReviewPanel } from "./DriverReviewPanel"

/** Everything the table needs about one driver, assembled server-side. */
export interface DriverListItem {
  driver: DriverRow
  /** Seven cells, Monday-first, from `weekStrip`. */
  week: (SlotState | null)[]
  openDays: number
  docsPresent: number
  docsTotal: number
  rating: number | null
  tripCount: number
}

type TabId = "pending" | "active" | "suspended" | "all"

const TABS: { id: TabId; label: string }[] = [
  { id: "pending", label: "Хүлээгдэж буй" },
  { id: "active", label: "Идэвхтэй" },
  { id: "suspended", label: "Түдгэлзсэн" },
  { id: "all", label: "Бүгд" },
]

const STATUS_PILL: Record<DriverStatus, string> = {
  pending: "bg-saffron-50 text-saffron-600",
  active: "bg-success/10 text-success",
  expiring: "bg-saffron-50 text-saffron-600",
  lapsed: "bg-destructive/10 text-destructive",
  unscheduled: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
}

function formatShort(dateKey: string): string {
  const [, m, d] = dateKey.split("-")
  return `${Number(m)}/${d}`
}

/** The one-line summary under the seven-day strip. Each status has its own
 *  sentence because each implies a different next action for the admin. */
function scheduleNote(item: DriverListItem, status: DriverStatus): React.ReactNode {
  const until = item.driver.schedule_open_until
  switch (status) {
    case "pending":
      return "Батлагдсаны дараа тохируулна"
    case "unscheduled":
      return "Нэг ч ээлж нээгээгүй"
    case "suspended":
      return "Хуваарь түр зогссон"
    case "lapsed":
      return until ? `Хуваарь ${formatShort(until)}-нд дууссан` : "Хуваарь дууссан"
    case "expiring":
      return until ? `Хуваарь ${formatShort(until)}-нд дуусна` : "Хуваарь дуусах дөхсөн"
    default:
      return (
        <>
          {item.openDays} өдөр нээлттэй
          {until && (
            <>
              {" · "}
              <b className="text-foreground">{formatShort(until)}</b> хүртэл
            </>
          )}
        </>
      )
  }
}

export function DriversTable({
  items,
  today,
}: {
  items: DriverListItem[]
  today: string
}) {
  const router = useRouter()
  const [tab, setTab] = React.useState<TabId>(() =>
    items.some((i) => i.driver.verification_status === "pending") ? "pending" : "active"
  )
  const [query, setQuery] = React.useState("")
  const [reviewing, setReviewing] = React.useState<DriverRow | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const withStatus = React.useMemo(
    () => items.map((item) => ({ item, status: driverStatus(item.driver, today) })),
    [items, today]
  )

  const counts = React.useMemo(() => {
    const c = { pending: 0, active: 0, suspended: 0, all: withStatus.length }
    for (const { status } of withStatus) c[statusTab(status)]++
    return c
  }, [withStatus])

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return withStatus.filter(({ item, status }) => {
      if (tab !== "all" && statusTab(status) !== tab) return false
      if (!q) return true
      // Name, phone and plate — the three things an admin has in hand when
      // someone calls in about a driver.
      const d = item.driver
      return (
        d.full_name.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.vehicle_plate.toLowerCase().includes(q)
      )
    })
  }, [withStatus, tab, query])

  async function setStatus(id: string, verification_status: "approved" | "rejected") {
    setBusyId(id)
    await fetch(`/api/admin/drivers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verification_status }),
    })
    setBusyId(null)
    router.refresh()
  }

  return (
    <>
      {/* tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-[11px] bg-muted p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] transition-colors",
                tab === t.id
                  ? "bg-card font-bold text-foreground shadow-sm"
                  : "font-semibold text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span
                  className={cn(
                    "rounded-pill px-1.5 text-[11px] font-extrabold",
                    t.id === "pending" && tab === t.id
                      ? "bg-saffron-50 text-saffron-600"
                      : "text-muted-foreground"
                  )}
                >
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <label className="flex w-full items-center gap-2 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] sm:w-60">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Нэр, утас, улсын дугаар…"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {/* table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[1.5fr_1.1fr_.95fr_1.35fr_210px] gap-3 border-b border-border bg-muted/40 px-5 py-2.5 text-eyebrow text-[11px] lg:grid">
          <span>Жолооч</span>
          <span>Машин</span>
          <span>Бичиг баримт</span>
          <span>Хуваарь · 7 хоног</span>
          <span className="text-right">Үйлдэл</span>
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            {query ? "Хайлтад тохирох жолооч алга." : "Энэ таб хоосон байна."}
          </p>
        ) : (
          rows.map(({ item, status }) => {
            const d = item.driver
            const pending = status === "pending"
            return (
              <div
                key={d.id}
                className={cn(
                  "grid grid-cols-1 items-center gap-3 border-b border-border/60 px-5 py-4 last:border-b-0",
                  "lg:grid-cols-[1.5fr_1.1fr_.95fr_1.35fr_210px]",
                  pending && "bg-saffron-50/40"
                )}
              >
                {/* driver */}
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full font-display text-[13.5px] font-extrabold",
                      pending
                        ? "bg-saffron-50 text-saffron-600"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {initials(d.full_name)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <b className="text-sm text-foreground">{d.full_name}</b>
                      <span
                        className={cn(
                          "rounded-pill px-2 py-0.5 text-[10.5px] font-extrabold",
                          STATUS_PILL[status]
                        )}
                      >
                        {DRIVER_STATUS_LABEL[status]}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                      {item.rating !== null ? (
                        <>
                          <Star className="size-3 shrink-0 fill-saffron text-saffron" />
                          <b className="text-foreground/80">{item.rating.toFixed(1)}</b>
                          <span>· {item.tripCount} аялал</span>
                        </>
                      ) : (
                        <span className="truncate">{d.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* vehicle */}
                <div className="text-[12.5px] text-foreground/80">
                  <b className="block text-[13px] text-foreground">
                    {d.vehicle_make} {d.vehicle_model}
                  </b>
                  {d.vehicle_plate}
                </div>

                {/* documents — state, not links. 2/3 reads at a glance. */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: item.docsTotal }, (_, i) => {
                    const ok = i < item.docsPresent
                    return (
                      <span
                        key={i}
                        className={cn(
                          "flex size-6 items-center justify-center rounded-[7px]",
                          ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {ok ? (
                          <Check className="size-3" strokeWidth={3} />
                        ) : (
                          <X className="size-3" strokeWidth={3} />
                        )}
                      </span>
                    )
                  })}
                  <span
                    className={cn(
                      "ml-1 text-[11.5px] font-bold",
                      item.docsPresent === item.docsTotal ? "text-success" : "text-destructive"
                    )}
                  >
                    {item.docsPresent}/{item.docsTotal}
                  </span>
                </div>

                {/* schedule */}
                <div>
                  <div className="flex gap-[3px]" aria-hidden>
                    {item.week.map((cell, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-[22px] w-[15px] rounded-[4px]",
                          cell === "booked"
                            ? "bg-saffron"
                            : cell === "open"
                              ? "bg-primary"
                              : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                    {scheduleNote(item, status)}
                  </p>
                </div>

                {/* actions */}
                <div className="flex justify-start gap-2 lg:justify-end">
                  {status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReviewing(d)}
                      >
                        Шалгах
                      </Button>
                      <Button
                        size="sm"
                        disabled={busyId === d.id}
                        onClick={() => setStatus(d.id, "approved")}
                      >
                        Батлах
                      </Button>
                    </>
                  ) : status === "suspended" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === d.id}
                      onClick={() => setStatus(d.id, "approved")}
                    >
                      Сэргээх
                    </Button>
                  ) : status === "active" ? (
                    <Button size="sm" variant="outline" onClick={() => setReviewing(d)}>
                      Хуваарь харах
                    </Button>
                  ) : (
                    <Button size="sm" variant="reserve" onClick={() => setReviewing(d)}>
                      Сануулга илгээх
                    </Button>
                  )}
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Бусад үйлдэл"
                    onClick={() => setReviewing(d)}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <DriverReviewPanel driver={reviewing} onClose={() => setReviewing(null)} />
    </>
  )
}
