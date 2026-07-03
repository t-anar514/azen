import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { BOOKING_STATUS_LABELS } from "@/lib/bookings"
import type { BookingRow } from "@/lib/supabase/types"

export const metadata = {
  title: "Миний хүргэлтүүд | Azen",
}

async function getMyBookings(): Promise<BookingRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("mn-MN", { dateStyle: "medium", timeStyle: "short" })
}

export default async function TransferHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirectTo=/transfer/history")
  }

  const bookings = await getMyBookings()

  return (
    <div className="min-h-screen bg-background pt-16 pb-16">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-6 text-2xl font-black text-foreground">Миний хүргэлтүүд</h1>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-gray-500">Та одоогоор хүргэлт захиалаагүй байна.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Link key={booking.id} href={`/transfer/trip/${booking.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-6">
                    <div>
                      <p className="font-semibold text-foreground">{booking.flight_number}</p>
                      <p className="text-sm text-gray-500">{formatDateTime(booking.pickup_datetime)}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
