import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { BOOKING_STATUS_LABELS } from "@/lib/bookings"
import type { BookingRow } from "@/lib/supabase/types"

export const metadata = {
  title: "Жолоочийн түүх | Azen",
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("mn-MN", { dateStyle: "medium", timeStyle: "short" })
}

export default async function DriverHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirectTo=/driver/history")
  }

  const { data: driver } = await supabase
    .from("drivers")
    .select("verification_status")
    .eq("id", user.id)
    .maybeSingle()

  if (!driver || driver.verification_status !== "approved") {
    redirect("/driver/apply")
  }

  const { data: jobs } = await supabase
    .from("bookings")
    .select("*")
    .eq("driver_id", user.id)
    .in("status", ["completed", "cancelled"])
    .order("pickup_datetime", { ascending: false })

  const pastJobs = (jobs ?? []) as BookingRow[]
  const completed = pastJobs.filter((j) => j.status === "completed")
  // Stubbed earnings figure — driver payouts aren't wired up yet (payments
  // are still a "pending" QPay stub), so this is just a transparency total
  // of fares for completed jobs, not an actual paid-out amount.
  const totalEarnings = completed.reduce((sum, j) => sum + Number(j.price), 0)

  return (
    <div className="min-h-screen bg-[#e6e2c3] pt-16 pb-16">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-2 text-2xl font-black text-[#1c315e]">Дууссан аяллууд</h1>
        <p className="mb-6 text-sm text-gray-600">
          Нийт орлого (төлбөр баталгаажаагүй ч): {" "}
          <span className="font-semibold text-[#227c70]">
            {new Intl.NumberFormat("mn-MN").format(totalEarnings)} ₮
          </span>
        </p>

        {pastJobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-gray-500">Дууссан аялал хараахан байхгүй байна.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-6">
                  <div>
                    <p className="font-mono text-sm text-gray-500">{job.trip_code}</p>
                    <p className="text-sm text-[#1c315e]">{formatDateTime(job.pickup_datetime)}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-[#227c70]/10 px-3 py-1 text-xs font-semibold text-[#227c70]">
                      {BOOKING_STATUS_LABELS[job.status]}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-[#1c315e]">
                      {new Intl.NumberFormat("mn-MN").format(job.price)} {job.currency}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
