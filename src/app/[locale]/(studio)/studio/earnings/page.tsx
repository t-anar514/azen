import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentGuide } from "@/lib/guides/current"
import { sumCompleted, earningsByMonth } from "@/lib/guides/statsMath"
import { EarningsBreakdown } from "@/components/studio/EarningsBreakdown"
import type { GuideBookingRow } from "@/lib/supabase/types"

/**
 * `/studio/earnings` (Орлого) — earnings are the sum of COMPLETED bookings
 * (`sumCompleted`), broken down per month (`earningsByMonth`), plus a
 * forward-looking total of confirmed-but-not-yet-completed trips.
 */
export default async function StudioEarningsPage() {
  const ctx = await getCurrentGuide()
  if (!ctx) redirect("/guides/apply")
  const { guide } = ctx
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from("guide_bookings")
    .select("amount,status,trip_date")
    .eq("guide_id", guide.id)
    .returns<Pick<GuideBookingRow, "amount" | "status" | "trip_date">[]>()
  const bookings = rows ?? []

  const total = sumCompleted(bookings)
  const months = earningsByMonth(bookings)
  const upcoming = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((s, b) => s + Number(b.amount), 0)

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">Орлого</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Дууссан аяллаас олсон орлого.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground">Нийт орлого</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-foreground">
            ¥{total.toLocaleString("mn-MN")}
          </div>
        </div>
        <div className="rounded-card border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground">Хүлээгдэж буй (баталгаажсан)</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-saffron-600">
            ¥{upcoming.toLocaleString("mn-MN")}
          </div>
        </div>
      </div>

      <h2 className="mb-3 font-display text-base font-bold">Сараар</h2>
      <EarningsBreakdown months={months} />
    </div>
  )
}
