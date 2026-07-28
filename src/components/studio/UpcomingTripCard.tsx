import { initials } from "@/lib/utils"
import type { GuideBookingRow } from "@/lib/supabase/types"

/** "11/14" style short date — deterministic regardless of ICU/locale quirks. */
export function formatTripDate(value: string) {
  const d = new Date(`${value}T00:00:00`)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

interface UpcomingTripCardProps {
  booking: GuideBookingRow
  travelerName: string
}

/**
 * One row of "Удахгүй болох аялал".
 *
 * Was RequestCard, which carried accept/decline: under pay-upfront a booking is
 * already paid and confirmed by the time the guide sees it, so this is a
 * heads-up, not a decision. Cancelling lives on /studio/bookings, deliberately
 * away from the dashboard glance.
 */
export function UpcomingTripCard({ booking, travelerName }: UpcomingTripCardProps) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-xs font-bold text-white">
        {initials(travelerName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-foreground">
          <b>{travelerName}</b> захиалга баталгаажсан
        </div>
        <div className="text-[11.5px] text-muted-foreground">
          {booking.city ? `${booking.city} · ` : ""}
          {formatTripDate(booking.trip_date)} · {booking.hours} цаг · ¥
          {booking.amount.toLocaleString("mn-MN")}
        </div>
      </div>
    </div>
  )
}
