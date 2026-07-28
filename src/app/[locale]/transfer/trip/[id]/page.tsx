import { notFound } from "next/navigation"
import { getBookingForViewer, getRevealedDriverInfo } from "@/lib/bookings"
import { BookingStatusCard } from "@/components/transfer/BookingStatusCard"
import { DriverLockedCard } from "@/components/transfer/DriverLockedCard"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TransferTripPage({ params }: PageProps) {
  const { id } = await params
  const booking = await getBookingForViewer(id)
  if (!booking) notFound()

  const { driver, revealAt } = await getRevealedDriverInfo(booking)

  return (
    <div className="min-h-screen bg-background pt-16">
      <BookingStatusCard booking={booking} driver={driver} heading="Аяллын явц" />
      {!driver && revealAt && (
        <div className="mx-auto mt-4 max-w-md px-4">
          <DriverLockedCard revealAt={revealAt.toISOString()} />
        </div>
      )}
    </div>
  )
}
