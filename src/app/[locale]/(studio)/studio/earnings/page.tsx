import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getStudioContext } from "@/lib/studio/context"
import { sumCompleted, earningsByMonth } from "@/lib/guides/statsMath"
import { EarningsBreakdown } from "@/components/studio/EarningsBreakdown"
import type { BookingRow, GuideBookingRow } from "@/lib/supabase/types"

/**
 * `/studio/earnings` (Орлого) — earnings are the sum of COMPLETED bookings
 * (`sumCompleted`), broken down per month (`earningsByMonth`), plus a
 * forward-looking total of confirmed-but-not-yet-completed work.
 *
 * Both professions land here. The arithmetic is identical, so the two branches
 * differ only in which table they read, which currency they print, and what
 * "still to come" means for that role — a guide's confirmed trip versus a
 * driver's assigned job.
 */
export default async function StudioEarningsPage() {
  const context = await getStudioContext()
  if (!context) redirect("/login?redirectTo=/studio/earnings")

  const supabase = await createClient()

  const view =
    context.kind === "driver"
      ? await loadDriverEarnings(supabase, context.driver.id)
      : await loadGuideEarnings(supabase, context.guide.id)

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">Орлого</h1>
        <p className="mt-1 text-sm text-muted-foreground">{view.blurb}</p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground">Нийт орлого</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-foreground">
            {view.symbol}
            {view.total.toLocaleString("mn-MN")}
          </div>
        </div>
        <div className="rounded-card border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground">{view.upcomingLabel}</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-saffron-600">
            {view.symbol}
            {view.upcoming.toLocaleString("mn-MN")}
          </div>
        </div>
      </div>

      <h2 className="mb-3 font-display text-base font-bold">Сараар</h2>
      <EarningsBreakdown months={view.months} />
    </div>
  )
}

type Supabase = Awaited<ReturnType<typeof createClient>>

async function loadGuideEarnings(supabase: Supabase, guideId: string) {
  const { data: rows } = await supabase
    .from("guide_bookings")
    .select("amount,status,trip_date")
    .eq("guide_id", guideId)
    .returns<Pick<GuideBookingRow, "amount" | "status" | "trip_date">[]>()
  const bookings = rows ?? []

  return {
    blurb: "Дууссан аяллаас олсон орлого.",
    symbol: "¥",
    total: sumCompleted(bookings),
    months: earningsByMonth(bookings),
    upcomingLabel: "Хүлээгдэж буй (баталгаажсан)",
    upcoming: bookings
      .filter((b) => b.status === "confirmed")
      .reduce((s, b) => s + Number(b.amount), 0),
  }
}

async function loadDriverEarnings(supabase: Supabase, driverId: string) {
  const { data: rows } = await supabase
    .from("bookings")
    .select("price,status,pickup_datetime,shift_date")
    .eq("driver_id", driverId)
    .returns<Pick<BookingRow, "price" | "status" | "pickup_datetime" | "shift_date">[]>()

  // Reshaped onto the guide vocabulary so the month rollup stays one tested
  // function rather than two that can drift. shift_date is preferred over the
  // pickup timestamp because it is already the local calendar day the job
  // belongs to — deriving a month from a timestamp would put a 00:30 pickup in
  // the wrong month at the boundary.
  const bookings = (rows ?? []).map((b) => ({
    amount: Number(b.price),
    status: b.status,
    trip_date: b.shift_date ?? b.pickup_datetime.slice(0, 10),
  }))

  return {
    blurb: "Дууссан ажлаас олсон орлого. 7 хоног тутам төлөгдөнө.",
    symbol: "₮",
    total: sumCompleted(bookings),
    months: earningsByMonth(bookings),
    upcomingLabel: "Хүлээгдэж буй (оногдсон)",
    upcoming: bookings
      .filter((b) => b.status === "assigned" || b.status === "en_route" || b.status === "arrived")
      .reduce((s, b) => s + b.amount, 0),
  }
}
