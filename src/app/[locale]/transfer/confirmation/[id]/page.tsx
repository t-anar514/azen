import Link from "next/link"
import { notFound } from "next/navigation"
import { getBookingForViewer, getRevealedDriverInfo } from "@/lib/bookings"
import { BookingStatusCard } from "@/components/transfer/BookingStatusCard"
import { DriverLockedCard } from "@/components/transfer/DriverLockedCard"
import { AddToPlannerButton } from "@/components/planner/AddToPlannerButton"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TransferConfirmationPage({ params }: PageProps) {
  const { id } = await params
  const booking = await getBookingForViewer(id)
  if (!booking) notFound()

  const { driver, revealAt } = await getRevealedDriverInfo(booking)

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-6xl px-4 pb-4 text-center">
        <p className="font-semibold text-primary">Баталгаажлаа!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Таны ээлжид машин захиалагдлаа. Хүлээх шаардлагагүй — жолооч аль хэдийн энэ цагийг
          нээсэн. Энэ хуудасны холбоосыг хадгалж, аяллын явцыг хянаарай.
        </p>
      </div>
      <BookingStatusCard booking={booking} driver={driver} />
      <div className="mx-auto max-w-6xl space-y-4 px-4 pb-16 text-center">
        {/* A driver exists but is not shown yet — say so, rather than leaving a
            gap the traveler reads as "nobody is coming". */}
        {!driver && revealAt && (
          <div className="mx-auto max-w-md text-left">
            <DriverLockedCard revealAt={revealAt.toISOString()} />
          </div>
        )}
        <AddToPlannerButton
          title={`Трансфер: ${booking.pickup_location} → ${booking.dropoff_location}`}
          date={booking.pickup_datetime.slice(0, 10)}
          type="car"
          location={booking.pickup_location}
          cost={booking.price}
          costCurrency={booking.currency === "JPY" ? "JPY" : booking.currency === "USD" ? "USD" : "MNT"}
        />
        <div>
          <Link href={`/transfer/trip/${booking.id}`} className="text-sm font-semibold text-foreground underline">
            Аяллын явцыг харах →
          </Link>
        </div>
      </div>
    </div>
  )
}
