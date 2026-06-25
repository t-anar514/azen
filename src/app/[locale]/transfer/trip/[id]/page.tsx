import { notFound } from "next/navigation"
import { getBookingForViewer, getDriverContactInfo } from "@/lib/bookings"
import { BookingStatusCard } from "@/components/transfer/BookingStatusCard"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TransferTripPage({ params }: PageProps) {
  const { id } = await params
  const booking = await getBookingForViewer(id)
  if (!booking) notFound()

  const driver = booking.driver_id ? await getDriverContactInfo(booking.driver_id) : null

  return (
    <div className="min-h-screen bg-[#e6e2c3] pt-16">
      <BookingStatusCard booking={booking} driver={driver} heading="Аяллын явц" />
    </div>
  )
}
