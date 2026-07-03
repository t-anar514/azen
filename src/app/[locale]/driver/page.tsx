import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { JobStatusActions } from "@/components/driver/JobStatusActions"
import { BOOKING_STATUS_LABELS } from "@/lib/bookings"
import type { BookingRow } from "@/lib/supabase/types"

export const metadata = {
  title: "Жолоочийн самбар | Azen",
}

const ACTIVE_STATUSES: BookingRow["status"][] = ["assigned", "en_route", "arrived", "picked_up"]

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("mn-MN", { dateStyle: "medium", timeStyle: "short" })
}

export default async function DriverDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirectTo=/driver")
  }

  const { data: driver } = await supabase
    .from("drivers")
    .select("verification_status")
    .eq("id", user.id)
    .maybeSingle()

  if (!driver) {
    redirect("/driver/apply")
  }

  if (driver.verification_status !== "approved") {
    redirect("/driver/apply")
  }

  // RLS (bookings_select) already scopes this to driver_id = auth.uid() or
  // an admin, so no extra filter is needed beyond the status window.
  const { data: jobs } = await supabase
    .from("bookings")
    .select("*")
    .eq("driver_id", user.id)
    .in("status", ACTIVE_STATUSES)
    .order("pickup_datetime", { ascending: true })

  const activeJobs = (jobs ?? []) as BookingRow[]

  return (
    <div className="min-h-screen bg-background pt-16 pb-16">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-black text-foreground">Жолоочийн самбар</h1>
          <Link href="/driver/history" className="text-sm font-semibold text-primary">
            Түүх →
          </Link>
        </div>

        {activeJobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-gray-500">
              Танд одоогоор томилогдсон захиалга байхгүй байна.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-sm text-gray-500">{job.trip_code}</p>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {BOOKING_STATUS_LABELS[job.status]}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-gray-500">Нислэг</p>
                      <p className="font-semibold text-foreground">{job.flight_number}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Цаг</p>
                      <p className="font-semibold text-foreground">{formatDateTime(job.pickup_datetime)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Авах газар</p>
                      <p className="font-semibold text-foreground">{job.pickup_location}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Хүргэх газар</p>
                      <p className="font-semibold text-foreground">{job.dropoff_location}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Зорчигч</p>
                      <p className="font-semibold text-foreground">{job.guest_name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Утас</p>
                      <a href={`tel:${job.guest_phone}`} className="font-semibold text-primary">
                        {job.guest_phone}
                      </a>
                    </div>
                  </div>

                  {job.notes && <p className="text-sm text-gray-600">Тэмдэглэл: {job.notes}</p>}

                  <JobStatusActions bookingId={job.id} currentStatus={job.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
