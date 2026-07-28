import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentGuide } from "@/lib/guides/current"
import { guideFallbackPath } from "@/lib/studio/context"
import { Badge } from "@/components/ui/badge"
import { formatTripDate } from "@/components/studio/UpcomingTripCard"
import { CompleteBookingButton } from "@/components/studio/CompleteBookingButton"
import { CancelBookingButton } from "@/components/studio/CancelBookingButton"
import { initials } from "@/lib/utils"
import type { GuideBookingRow, GuideBookingStatus } from "@/lib/supabase/types"

const STATUS_PILL: Record<GuideBookingStatus, { label: string; variant: "confirmed" | "paid" | "canceled" | "pending" }> = {
  awaiting_payment: { label: "Төлбөр хүлээгдэж буй", variant: "pending" },
  confirmed: { label: "Баталгаажсан", variant: "confirmed" },
  completed: { label: "Дууссан", variant: "paid" },
  expired: { label: "Хугацаа дууссан", variant: "canceled" },
  pending: { label: "Хүлээгдэж буй", variant: "pending" },
  declined: { label: "Татгалзсан", variant: "canceled" },
  cancelled: { label: "Цуцалсан", variant: "pending" },
}

/**
 * `/studio/bookings` (Захиалга) — the full guide_bookings ledger grouped by
 * lifecycle: in-flight payment holds, legacy requests still awaiting
 * accept/decline, confirmed upcoming trips (mark completed → feeds Орлого),
 * then closed rows as read-only history.
 */
export default async function StudioBookingsPage() {
  const ctx = await getCurrentGuide()
  if (!ctx) redirect(await guideFallbackPath())
  const { guide } = ctx
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from("guide_bookings")
    .select("*")
    .eq("guide_id", guide.id)
    .order("trip_date", { ascending: false })
    .returns<GuideBookingRow[]>()
  const bookings = rows ?? []

  const names = await Promise.all(
    bookings.map((b) =>
      supabase
        .rpc("participant_display_name", { p_user_id: b.traveler_id })
        .then(({ data }) => (data as string | null)?.trim() || "Аялагч")
    )
  )
  const nameById = Object.fromEntries(bookings.map((b, i) => [b.id, names[i]]))

  // Travelers pay up front, so a new booking arrives already `confirmed` — it
  // is never the guide's to accept. `awaiting_payment` is the ≤15min hold while
  // the traveler is in checkout: not actionable, but it is why the date shows
  // as taken on their calendar, so it is listed rather than hidden. `pending`
  // and `declined` only ever match rows predating the pay-upfront flow, and are
  // shown as history so nothing silently disappears from the ledger.
  const holds = bookings.filter((b) => b.status === "awaiting_payment")
  const confirmed = bookings.filter((b) => b.status === "confirmed")
  const closed = bookings.filter((b) =>
    ["completed", "declined", "cancelled", "expired", "pending"].includes(b.status)
  )

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">Захиалга</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Аялагчдын хүсэлт, баталгаажсан болон дууссан аяллууд.
        </p>
      </header>

      {bookings.length === 0 ? (
        <div className="rounded-card border border-border bg-card px-5 py-16 text-center">
          <p className="text-sm text-muted-foreground">Одоогоор захиалга алга.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Аялагч таны нийтийн профайлаас хөтөч захиалахад энд харагдана.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {holds.length > 0 && (
            <Section title="Төлбөр хүлээгдэж буй" count={holds.length}>
              <div className="flex flex-col gap-2.5">
                {holds.map((b) => (
                  <BookingRow key={b.id} booking={b} travelerName={nameById[b.id]} />
                ))}
              </div>
            </Section>
          )}

          {confirmed.length > 0 && (
            <Section title="Баталгаажсан аялал" count={confirmed.length}>
              <div className="flex flex-col gap-2.5">
                {confirmed.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    travelerName={nameById[b.id]}
                    action={
                      <div className="flex shrink-0 items-center gap-1">
                        <CancelBookingButton id={b.id} />
                        <CompleteBookingButton id={b.id} />
                      </div>
                    }
                  />
                ))}
              </div>
            </Section>
          )}

          {closed.length > 0 && (
            <Section title="Хаагдсан" count={closed.length}>
              <div className="flex flex-col gap-2.5">
                {closed.map((b) => (
                  <BookingRow key={b.id} booking={b} travelerName={nameById[b.id]} />
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-display text-base font-bold">{title}</h2>
        <span className="text-sm font-semibold text-muted-foreground">{count}</span>
      </div>
      {children}
    </section>
  )
}

function BookingRow({
  booking,
  travelerName,
  action,
}: {
  booking: GuideBookingRow
  travelerName: string
  action?: React.ReactNode
}) {
  const pill = STATUS_PILL[booking.status]
  return (
    <div className="flex items-center gap-3 rounded-thumb border border-border bg-card p-3.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-[13px] font-bold text-white">
        {initials(travelerName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{travelerName}</div>
        <div className="text-xs text-muted-foreground">
          {booking.city ? `${booking.city} · ` : ""}
          {formatTripDate(booking.trip_date)} · {booking.hours} цаг · ¥{booking.amount.toLocaleString("mn-MN")}
        </div>
      </div>
      {action ?? <Badge variant={pill.variant}>{pill.label}</Badge>}
    </div>
  )
}
