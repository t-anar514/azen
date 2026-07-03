import Link from "next/link"
import { notFound } from "next/navigation"
import { getBookingForViewer, getDriverContactInfo } from "@/lib/bookings"
import { BookingStatusCard } from "@/components/transfer/BookingStatusCard"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TransferConfirmationPage({ params }: PageProps) {
  const { id } = await params
  const booking = await getBookingForViewer(id)
  if (!booking) notFound()

  const driver = booking.driver_id ? await getDriverContactInfo(booking.driver_id) : null

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-2xl px-4 pb-4 text-center">
        <p className="font-semibold text-primary">Захиалга хүлээн авлаа!</p>
        <p className="mt-1 text-sm text-gray-600">
          Бид төлбөрийг баталгаажуулж, жолооч томилно. Энэ хуудасны холбоосыг хадгалж, аяллын явцыг
          хянаарай.
        </p>
      </div>
      <BookingStatusCard booking={booking} driver={driver} />
      <div className="mx-auto max-w-2xl px-4 pb-16 text-center">
        <Link href={`/transfer/trip/${booking.id}`} className="text-sm font-semibold text-foreground underline">
          Аяллын явцыг харах →
        </Link>
      </div>
    </div>
  )
}
