import {
  Car,
  Check,
  CircleAlert,
  LifeBuoy,
  MapPin,
  MessageSquare,
  Phone,
  Plane,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { TripCountdown } from "@/components/transfer/TripCountdown"
import { CopyCode } from "@/components/transfer/CopyCode"
import { cn, initials } from "@/lib/utils"
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_ORDER,
  type DriverContactInfo,
} from "@/lib/bookings"
import {
  estimateTransferDuration,
  formatDistance,
  formatTransferPrice,
} from "@/lib/transfers/format"
import { formatMnMonthDay } from "@/lib/planner/format"
import type { BookingRow } from "@/lib/supabase/types"

interface BookingStatusCardProps {
  booking: BookingRow
  driver: DriverContactInfo | null
  heading?: string
}

/** "2026-07-27T09:32:00Z" → "7-р сарын 27, 09:32" (hand-formatted; see planner/format). */
function formatWhen(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  return `${formatMnMonthDay(value)}, ${time}`
}

/**
 * Headline per status. Driven by `status`, never by "is a driver attached" —
 * a driver is assigned well before they set off, so keying the "on the way"
 * copy off the driver record tells the passenger something untrue.
 */
const STATUS_HEADLINE: Record<BookingRow["status"], string> = {
  pending_payment: "Төлбөр хүлээгдэж байна",
  confirmed: "Захиалга баталгаажлаа",
  assigned: "Жолооч томилогдлоо",
  en_route: "Жолооч тань замд гарлаа",
  arrived: "Жолооч авах цэг дээр ирсэн",
  picked_up: "Аялал үргэлжилж байна",
  completed: "Аялал дууслаа",
  cancelled: "Энэ захиалга цуцлагдсан",
}

/**
 * Timeline labels once a step is behind you. The status labels are written for
 * the *current* state ("Төлбөр хүлээгдэж байна"), which reads wrong with a tick
 * next to it.
 */
const STATUS_LABEL_DONE: Partial<Record<BookingRow["status"], string>> = {
  pending_payment: "Төлбөр хүлээн авсан",
  en_route: "Жолооч замдаа гарсан",
  arrived: "Жолооч ирсэн",
}

/** Sub-label under each completed timeline step. */
const STATUS_HINT: Partial<Record<BookingRow["status"], string>> = {
  pending_payment: "Төлбөр баталгаажмагц жолооч томилно",
  confirmed: "Захиалга баталгаажсан",
  assigned: "Жолоочийн мэдээлэл доор харагдана",
  en_route: "Жолооч танай зүг явж байна",
  arrived: "Жолооч авах цэг дээр хүлээж байна",
  picked_up: "Аялал үргэлжилж байна",
  completed: "Аялал дууссан",
}

export function BookingStatusCard({ booking, driver, heading }: BookingStatusCardProps) {
  const isCancelled = booking.status === "cancelled"
  const awaitingPayment = booking.status === "pending_payment"
  const currentIndex = BOOKING_STATUS_ORDER.indexOf(booking.status)
  const progress = isCancelled
    ? 0
    : ((currentIndex + 1) / BOOKING_STATUS_ORDER.length) * 100

  const distance = formatDistance(booking.distance_km)
  const duration = estimateTransferDuration(booking.distance_km)

  // Tone: amber while money is outstanding, red when cancelled, sky otherwise.
  const heroTone = isCancelled
    ? "from-gray-700 to-gray-600"
    : awaitingPayment
      ? "from-saffron-600 to-saffron"
      : "from-sky-900 to-sky-700"

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
        <div>
          {heading && (
            <h1 className="font-display text-[22px] font-extrabold text-foreground">
              {heading}
            </h1>
          )}
        </div>
        <CopyCode code={booking.trip_code} />
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_296px] lg:items-start lg:gap-6">
        <div className="space-y-4">
          {/* ── live status hero ── */}
          <section
            className={cn(
              "rounded-card bg-gradient-to-br px-5 py-5 text-white sm:px-6",
              heroTone
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-block rounded-pill bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
                  {isCancelled ? "Цуцлагдсан" : BOOKING_STATUS_LABELS[booking.status]}
                </span>
                <p className="mt-2 font-display text-[20px] font-extrabold leading-tight sm:text-[24px]">
                  {STATUS_HEADLINE[booking.status]}
                </p>
                <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-white/70">
                  {isCancelled
                    ? "Асуулт байвал дэмжлэгийн багтай холбогдоно уу."
                    : awaitingPayment
                      ? "Төлбөр төлөгдмөгц захиалга баталгаажиж, жолооч томилогдоно."
                      : `${formatWhen(booking.pickup_datetime)}-д ${booking.pickup_location} дээр уулзана.`}
                </p>
              </div>

              {!isCancelled && (
                <div className="flex flex-col items-end text-right">
                  <TripCountdown
                    target={booking.pickup_datetime}
                    className="font-display text-[30px] font-extrabold leading-none"
                    labelClassName="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60"
                  />
                </div>
              )}
            </div>

            {!isCancelled && (
              <div className="mt-5">
                <div className="relative h-1.5 rounded-pill bg-white/20">
                  <div
                    className="h-full rounded-pill bg-white/90 transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                  <Car
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white"
                    style={{ left: `${progress}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            )}

            {awaitingPayment && (
              <Button
                variant="reserve"
                className="mt-4 w-full bg-white text-saffron-600 hover:bg-white/90 sm:w-auto"
                asChild
              >
                <Link href="/transfer/history">Төлбөрийн мэдээлэл</Link>
              </Button>
            )}
          </section>

          {/* ── driver ── */}
          {driver ? (
            <section className="rounded-card border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tint-sky text-[12px] font-bold text-sky-700">
                  {initials(driver.full_name)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[14.5px] font-bold text-foreground">
                    {driver.full_name}
                    {driver.verification_status === "approved" && (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-tint-sage px-2 py-0.5 text-[10px] font-semibold text-success">
                        <Check className="h-2.5 w-2.5" />
                        Баталгаажсан
                      </span>
                    )}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {[driver.vehicle_make, driver.vehicle_model].filter(Boolean).join(" ") ||
                      "Тээврийн хэрэгсэл"}
                    {driver.vehicle_plate && (
                      <span className="ml-2 rounded-well bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                        {driver.vehicle_plate}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="message" size="sm" asChild>
                    <a href={`tel:${driver.phone}`}>
                      <Phone className="mr-1.5 h-3.5 w-3.5" />
                      Залгах
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`sms:${driver.phone}`}>
                      <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                      Мессеж
                    </a>
                  </Button>
                </div>
              </div>
            </section>
          ) : (
            !isCancelled && (
              <p className="rounded-card border border-dashed border-border bg-card px-4 py-3 text-center text-[12.5px] text-muted-foreground">
                Жолооч хараахан томилогдоогүй байна — баталгаажсаны дараа эндээс харагдана.
              </p>
            )
          )}

          {/* ── route ── */}
          <section className="rounded-card border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Аяллын маршрут
              </p>
              {booking.flight_number && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-tint-sky px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                  <Plane className="h-3 w-3" />
                  {booking.flight_number}
                </span>
              )}
            </div>

            <ol className="relative space-y-4">
              <li className="flex gap-3">
                <span className="relative flex flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-saffron" />
                  <span className="mt-1 w-px flex-1 border-l border-dashed border-border" />
                </span>
                <div className="min-w-0 pb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Авах цэг
                  </p>
                  <p className="text-[14px] font-semibold text-foreground">
                    {booking.pickup_location}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {formatWhen(booking.pickup_datetime)}
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Хүрэх цэг
                  </p>
                  <p className="text-[14px] font-semibold text-foreground">
                    {booking.dropoff_location}
                  </p>
                </div>
              </li>
            </ol>

            {(distance || duration) && (
              <div className="mt-4 flex gap-6 border-t border-border pt-3">
                {distance && (
                  <div>
                    <p className="text-[15px] font-bold text-foreground">{distance}</p>
                    <p className="text-[11px] text-muted-foreground">Зай</p>
                  </div>
                )}
                {duration && (
                  <div>
                    <p className="text-[15px] font-bold text-foreground">{duration}</p>
                    <p className="text-[11px] text-muted-foreground">Ойролцоо хугацаа</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* ── sidebar ── */}
        <aside className="mt-4 space-y-4 lg:mt-0">
          {!isCancelled && (
            <section className="rounded-card border border-border bg-card p-4">
              <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Захиалгын явц
              </p>
              <ol className="space-y-0">
                {BOOKING_STATUS_ORDER.map((step, i) => {
                  const done = i < currentIndex
                  const active = i === currentIndex
                  const last = i === BOOKING_STATUS_ORDER.length - 1
                  return (
                    <li key={step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                            done && "bg-success",
                            active && "bg-saffron ring-4 ring-tint-saffron",
                            !done && !active && "bg-border"
                          )}
                        >
                          {done && <Check className="h-2.5 w-2.5 text-white" />}
                        </span>
                        {!last && (
                          <span
                            className={cn(
                              "w-px flex-1",
                              done ? "bg-success/40" : "bg-border"
                            )}
                          />
                        )}
                      </div>
                      <div className={cn("min-w-0", last ? "pb-0" : "pb-4")}>
                        <p
                          className={cn(
                            "text-[12.5px] font-semibold leading-tight",
                            active
                              ? "text-foreground"
                              : done
                                ? "text-foreground/70"
                                : "text-muted-foreground"
                          )}
                        >
                          {done
                            ? (STATUS_LABEL_DONE[step] ?? BOOKING_STATUS_LABELS[step])
                            : BOOKING_STATUS_LABELS[step]}
                        </p>
                        {active && STATUS_HINT[step] && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {STATUS_HINT[step]}
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          )}

          <section className="rounded-card border border-border bg-card p-4">
            <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Төлбөр
            </p>
            <dl className="space-y-2 text-[12.5px]">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="min-w-0 truncate text-muted-foreground">
                  {booking.pickup_location} → {booking.dropoff_location}
                </dt>
                <dd className="shrink-0 font-semibold text-foreground">
                  {formatTransferPrice(booking.price, booking.currency)}
                </dd>
              </div>
            </dl>
            <div className="my-3 h-px bg-border" />
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[12.5px] font-semibold text-muted-foreground">Нийт</span>
              <span className="font-display text-[18px] font-extrabold text-foreground">
                {formatTransferPrice(booking.price, booking.currency)}
              </span>
            </div>
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-[11px]",
                awaitingPayment ? "text-saffron-600" : "text-success"
              )}
            >
              {awaitingPayment ? (
                <>
                  <CircleAlert className="h-3 w-3" />
                  Төлбөр хүлээгдэж байна
                </>
              ) : (
                <>
                  <Check className="h-3 w-3" />
                  Төлбөр баталгаажсан
                </>
              )}
            </p>
          </section>

          <div className="space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/transfer/history">
                <MapPin className="mr-1.5 h-4 w-4" />
                Миний аяллууд
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/contact">
                <LifeBuoy className="mr-1.5 h-4 w-4" />
                Дэмжлэг
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
