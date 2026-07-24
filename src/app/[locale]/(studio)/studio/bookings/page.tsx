import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentGuide } from "@/lib/guides/current"
import { Badge } from "@/components/ui/badge"
import { RequestCard, formatTripDate } from "@/components/studio/RequestCard"
import { CompleteBookingButton } from "@/components/studio/CompleteBookingButton"
import { initials } from "@/lib/utils"
import type { GuideBookingRow, GuideBookingStatus } from "@/lib/supabase/types"

const STATUS_PILL: Record<GuideBookingStatus, { label: string; variant: "confirmed" | "paid" | "canceled" | "pending" }> = {
  pending: { label: "Хүлээгдэж буй", variant: "pending" },
  confirmed: { label: "Баталгаажсан", variant: "confirmed" },
  completed: { label: "Дууссан", variant: "paid" },
  declined: { label: "Татгалзсан", variant: "canceled" },
  cancelled: { label: "Цуцалсан", variant: "pending" },
}

/**
 * `/studio/bookings` (Захиалга) — the full guide_bookings ledger grouped by
 * lifecycle: pending requests (accept/decline), confirmed upcoming trips
 * (mark completed → feeds Орлого), then closed rows (completed/declined/
 * cancelled) as read-only history.
 */
export default async function StudioBookingsPage() {
  const ctx = await getCurrentGuide()
  if (!ctx) redirect("/guides/apply")
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

  const pending = bookings.filter((b) => b.status === "pending")
  const confirmed = bookings.filter((b) => b.status === "confirmed")
  const closed = bookings.filter((b) => ["completed", "declined", "cancelled"].includes(b.status))

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
          {pending.length > 0 && (
            <Section title="Шинэ хүсэлт" count={pending.length}>
              <div className="flex flex-col gap-3.5">
                {pending.map((b) => (
                  <RequestCard key={b.id} booking={b} travelerName={nameById[b.id]} />
                ))}
              </div>
            </Section>
          )}

          {confirmed.length > 0 && (
            <Section title="Баталгаажсан аялал" count={confirmed.length}>
              <div className="flex flex-col gap-2.5">
                {confirmed.map((b) => (
                  <BookingRow key={b.id} booking={b} travelerName={nameById[b.id]} action={<CompleteBookingButton id={b.id} />} />
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
