import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransferRowActions } from "@/components/admin/TransferRowActions"
import { BOOKING_STATUS_LABELS } from "@/lib/bookings"
import type { BookingRow, DriverRow, PaymentRow } from "@/lib/supabase/types"

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("mn-MN", { dateStyle: "medium", timeStyle: "short" })
}

async function getData() {
  const supabase = await createClient()
  const [{ data: bookings }, { data: drivers }, { data: payments }] = await Promise.all([
    supabase.from("bookings").select("*").order("pickup_datetime", { ascending: false }),
    supabase.from("drivers").select("*").eq("verification_status", "approved"),
    supabase.from("payments").select("*"),
  ])

  return {
    bookings: (bookings ?? []) as BookingRow[],
    drivers: (drivers ?? []) as DriverRow[],
    payments: (payments ?? []) as PaymentRow[],
  }
}

export default async function AdminTransfersPage() {
  const { bookings, drivers, payments } = await getData()
  const paymentByBooking = new Map(payments.map((p) => [p.booking_id, p]))
  const driverOptions = drivers.map((d) => ({ id: d.id, full_name: d.full_name }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase italic tracking-tight">Transfers</h1>
        <p className="text-muted-foreground">
          Assign drivers, update job status, and mark payments as received. No live gateway yet —
          payments are stubbed as &quot;pending&quot; until marked paid here.
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">No bookings yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const payment = paymentByBooking.get(booking.id)
            return (
              <Card key={booking.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">{booking.trip_code}</p>
                      <p className="font-semibold">{booking.guest_name} · {booking.flight_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{BOOKING_STATUS_LABELS[booking.status]}</Badge>
                      <Badge variant={payment?.status === "paid" ? "secondary" : "outline"}>
                        payment: {payment?.status ?? "—"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>{formatDateTime(booking.pickup_datetime)}</p>
                    <p>{booking.pickup_location} → {booking.dropoff_location}</p>
                    <p>{booking.guest_phone} · {booking.guest_email}</p>
                    <p>
                      {new Intl.NumberFormat("mn-MN").format(booking.price)} {booking.currency}
                    </p>
                  </div>

                  <TransferRowActions
                    bookingId={booking.id}
                    status={booking.status}
                    driverId={booking.driver_id}
                    paymentStatus={payment?.status ?? null}
                    drivers={driverOptions}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
