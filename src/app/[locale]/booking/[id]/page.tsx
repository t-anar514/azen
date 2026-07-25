import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * Booking confirmation page.
 *
 * A traveler lands here after Wire redirects them back from checkout. The
 * webhook may or may not have confirmed the payment yet — this page checks
 * the current status and shows what's next.
 */

export default async function BookingConfirmationPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Fetch the booking to check its status
  const { data: booking } = await supabase
    .from("guide_bookings")
    .select("id, guide_id, trip_date, hours, status, code, guide:guides(name)")
    .eq("id", id)
    .eq("traveler_id", user.id)
    .single<{
      id: string
      guide_id: string
      trip_date: string
      hours: number
      status: string
      code: string | null
      guide: { name: string }
    }>()

  if (!booking) redirect("/")

  const confirmed = booking.status === "confirmed"
  const formatDate = (d: string) => {
    const dt = new Date(`${d}T00:00:00`)
    return dt.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <div className="rounded-card border border-border bg-card p-8">
        {confirmed ? (
          <>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <div className="h-6 w-6 text-success">✓</div>
            </div>
            <h1 className="font-display text-2xl font-extrabold md:text-3xl">
              Захиалга баталгаажлаа
            </h1>
            <p className="mt-2 text-muted-foreground">
              Та {booking.guide.name} хөтөчтэй {formatDate(booking.trip_date)} {booking.hours} цагийн
              аялалтай.
            </p>
            {booking.code && (
              <div className="mt-6 rounded-thumb border border-border bg-secondary p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Захиалга код</p>
                <p className="mt-2 font-display text-lg font-bold">{booking.code}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <div className="h-6 w-6 text-muted-foreground">…</div>
            </div>
            <h1 className="font-display text-2xl font-extrabold md:text-3xl">
              Төлбөр хүлээгдэж байна
            </h1>
            <p className="mt-2 text-muted-foreground">
              Таны төлбөр баталгаажих хүртэл хүлээнэ үү. Энэ нь ихэнхдээ хэд хэдэн секундэд хийгддэг.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-block rounded-thumb bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Шалгах
            </button>
          </>
        )}
      </div>
    </div>
  )
}
