import { redirect } from "next/navigation"
import { Plane, User } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getStudioContext } from "@/lib/studio/context"
import { BOOKING_STATUS_LABELS } from "@/lib/bookings"
import { JobStatusActions } from "@/components/driver/JobStatusActions"
import { MONTH_LABEL, slotMeta, type ShiftSlot } from "@/lib/drivers/shifts"
import { cn } from "@/lib/utils"
import type { BookingRow } from "@/lib/supabase/types"

export const metadata = { title: "Ажлууд | Azen Studio" }
export const dynamic = "force-dynamic"

const LIVE_STATUSES = ["assigned", "en_route", "arrived", "picked_up"] as const

const togrog = new Intl.NumberFormat("mn-MN")

function formatWhen(iso: string): string {
  const d = new Date(iso)
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  return `${MONTH_LABEL(d.getMonth() + 1)}ын ${d.getDate()} · ${time}`
}

/**
 * `/studio/jobs` (Ажлууд) — what the driver has been given, not what they must
 * decide on.
 *
 * There is deliberately no accept/decline control here. Under the new model a
 * job arrives already paid for against a shift the driver themselves opened, so
 * an approval step would be an offer to renege on a promise the traveler has
 * already been charged for. Cancelling exists, but it is an exception handled
 * through support, not a button next to every row.
 */
export default async function DriverJobsPage() {
  const context = await getStudioContext()
  if (!context) redirect("/login?redirectTo=/studio/jobs")
  if (context.kind !== "driver") redirect("/studio")

  const supabase = await createClient()
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("driver_id", context.driver.id)
    .order("pickup_datetime", { ascending: false })
    .limit(60)

  const bookings = (data ?? []) as BookingRow[]
  const live = bookings.filter((b) =>
    (LIVE_STATUSES as readonly string[]).includes(b.status)
  )
  const past = bookings.filter(
    (b) => !(LIVE_STATUSES as readonly string[]).includes(b.status)
  )

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">Ажлууд</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Таны нээсэн ээлж дээр төлбөр хийгдмэгц ажил автоматаар оногддог —
          зөвшөөрөх алхам байхгүй.
        </p>
      </header>

      {bookings.length === 0 ? (
        <p className="rounded-card border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
          Одоогоор ажил алга. <b className="text-foreground">Хуваарь</b> хэсгээс ээлжээ нээвэл
          энд харагдана.
        </p>
      ) : (
        <>
          <JobList
            title="Идэвхтэй"
            bookings={live}
            emptyNote="Явагдаж буй ажил алга."
            live
          />
          {past.length > 0 && (
            <JobList title="Өмнөх" bookings={past} emptyNote="" className="mt-8" />
          )}
        </>
      )}
    </div>
  )
}

function JobList({
  title,
  bookings,
  emptyNote,
  className,
  live = false,
}: {
  title: string
  bookings: BookingRow[]
  emptyNote: string
  className?: string
  /** Live jobs get the status-advance control; finished ones have nothing left
   *  to advance, and a stale button there would only invite a mis-tap. */
  live?: boolean
}) {
  return (
    <section className={className}>
      <h2 className="mb-3 font-display text-base font-bold text-foreground">{title}</h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyNote}</p>
      ) : (
        <ul className="space-y-2.5">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="rounded-card border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-muted-foreground">
                    {formatWhen(b.pickup_datetime)}
                    {b.shift_slot && ` · ${slotMeta(b.shift_slot as ShiftSlot).label}`}
                  </div>
                  <div className="mt-0.5 font-display text-[15px] font-bold text-foreground">
                    {b.pickup_location} → {b.dropoff_location}
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-pill px-2 py-0.5 text-[10.5px] font-bold",
                    b.status === "completed"
                      ? "bg-success/10 text-success"
                      : b.status === "cancelled"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {BOOKING_STATUS_LABELS[b.status]}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Plane className="size-3.5" /> {b.flight_number}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5" /> {b.guest_name}
                </span>
                <span className="ml-auto font-bold text-foreground">
                  ₮{togrog.format(Number(b.price))}
                </span>
              </div>

              {live && (
                <div className="mt-3 border-t border-border pt-3">
                  <JobStatusActions bookingId={b.id} currentStatus={b.status} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
