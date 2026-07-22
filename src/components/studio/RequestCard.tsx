import { AcceptDeclineButtons } from "./AcceptDeclineButtons"
import { initials } from "@/lib/utils"
import type { GuideBookingRow } from "@/lib/supabase/types"

/** "11/14" style short date — deterministic regardless of ICU/locale quirks. */
export function formatTripDate(value: string) {
  const d = new Date(`${value}T00:00:00`)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

interface RequestCardProps {
  booking: GuideBookingRow
  travelerName: string
}

/** One row of "Ирсэн хүсэлт" (design doc, Screen 09/10). */
export function RequestCard({ booking, travelerName }: RequestCardProps) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-xs font-bold text-white">
        {initials(travelerName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-foreground">
          <b>{travelerName}</b> захиалга хүсэв
        </div>
        <div className="text-[11.5px] text-muted-foreground">
          {booking.city ? `${booking.city} · ` : ""}
          {formatTripDate(booking.trip_date)} · {booking.hours} цаг · ¥{booking.amount.toLocaleString("mn-MN")}
        </div>
        <div className="mt-2">
          <AcceptDeclineButtons id={booking.id} />
        </div>
      </div>
    </div>
  )
}
