import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookingStatusCard } from "@/components/transfer/BookingStatusCard"
import type { BookingRow } from "@/lib/supabase/types"

interface ActiveBookingBannerProps {
  booking: BookingRow
  driver: { full_name: string; phone: string } | null
}

// State A — a logged-in user already has a transfer in flight, so /transfer
// shows it directly instead of an empty form. This is the "I lost my
// confirmation link" fix for authenticated users: /transfer is always the way
// back to their trip. The escape hatch links to ?new=1, which the page reads
// to skip this banner and drop into a fresh booking (State C).
export function ActiveBookingBanner({ booking, driver }: ActiveBookingBannerProps) {
  return (
    <div className="min-h-screen bg-background pt-16">
      <BookingStatusCard booking={booking} driver={driver} heading="Таны идэвхтэй хүргэлт" />
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-3 px-4 pb-16">
        <Button asChild variant="outline">
          <Link href={`/transfer/trip/${booking.id}`}>Аяллын явцыг харах</Link>
        </Button>
        <Button asChild variant="reserve">
          <Link href="/transfer?new=1">Шинэ хүргэлт захиалах</Link>
        </Button>
      </div>
    </div>
  )
}
