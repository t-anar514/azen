import { Check, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_ORDER } from "@/lib/bookings"
import type { BookingRow } from "@/lib/supabase/types"

interface BookingStatusCardProps {
  booking: BookingRow
  driver: { full_name: string; phone: string } | null
  heading?: string
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("mn-MN", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function BookingStatusCard({ booking, driver, heading }: BookingStatusCardProps) {
  const isCancelled = booking.status === "cancelled"
  const currentIndex = BOOKING_STATUS_ORDER.indexOf(booking.status)

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 pb-16">
      <Card>
        <CardContent className="space-y-4 pt-6">
          {heading && <h1 className="text-2xl font-black text-[#1c315e]">{heading}</h1>}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-sm text-gray-500">Аяллын код: {booking.trip_code}</p>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                isCancelled ? "bg-red-100 text-red-700" : "bg-[#227c70]/10 text-[#227c70]"
              )}
            >
              {BOOKING_STATUS_LABELS[booking.status]}
            </span>
          </div>

          {!isCancelled && (
            <div className="flex flex-wrap gap-2 pt-2">
              {BOOKING_STATUS_ORDER.map((step, i) => (
                <div
                  key={step}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                    i <= currentIndex ? "bg-[#227c70] text-white" : "bg-gray-100 text-gray-400"
                  )}
                >
                  {i < currentIndex && <Check className="h-3 w-3" />}
                  {BOOKING_STATUS_LABELS[step]}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-gray-500">Нислэгийн дугаар</p>
              <p className="font-semibold text-[#1c315e]">{booking.flight_number}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Цаг</p>
              <p className="font-semibold text-[#1c315e]">{formatDateTime(booking.pickup_datetime)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Авах газар</p>
              <p className="font-semibold text-[#1c315e]">{booking.pickup_location}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Хүргэх газар</p>
              <p className="font-semibold text-[#1c315e]">{booking.dropoff_location}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Үнэ</p>
              <p className="font-semibold text-[#227c70]">
                {new Intl.NumberFormat("mn-MN").format(booking.price)} {booking.currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {driver && (
        <Card className="border-[#227c70]/40 bg-[#227c70]/5">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs uppercase text-gray-500">Жолооч</p>
              <p className="font-semibold text-[#1c315e]">{driver.full_name}</p>
            </div>
            <a
              href={`tel:${driver.phone}`}
              className="flex items-center gap-2 rounded-full bg-[#227c70] px-4 py-2 text-sm font-semibold text-white"
            >
              <Phone className="h-4 w-4" /> {driver.phone}
            </a>
          </CardContent>
        </Card>
      )}

      {!driver && !isCancelled && (
        <p className="text-center text-sm text-gray-500">
          Жолооч хараахан томилогдоогүй байна — баталгаажсаны дараа эндээс харагдах болно.
        </p>
      )}
    </div>
  )
}
