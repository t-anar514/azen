"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, Copy, MessageSquare, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { mn } from "date-fns/locale"
import { Link } from "@/i18n/routing"
import { cn, initials } from "@/lib/utils"
import { formatMnDay } from "@/lib/planner/format"
import {
  addHours,
  DURATION_OPTIONS,
  INTEREST_OPTIONS,
  NOTE_MAX_LENGTH,
  quoteBooking,
  START_TIME_OPTIONS,
  yen,
} from "@/lib/guides/booking"
import {
  MAX_MONTHS_AHEAD,
  resolveDayState,
  toDateKey,
} from "@/lib/guides/availability"
import type { GuideRow } from "@/lib/supabase/types"

interface BookGuideDialogProps {
  guide: GuideRow
  /** Custom trigger (e.g. the mobile compact CTA). Defaults to the saffron CTA. */
  trigger?: React.ReactNode
}

function Chip({
  selected,
  children,
  ...props
}: React.ComponentProps<"button"> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "rounded-pill border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
        selected
          ? "border-primary bg-secondary text-primary"
          : "border-border bg-card text-muted-foreground hover:border-sky-200 hover:text-foreground"
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  )
}

/**
 * Staged guide booking. The previous single-screen version collected a date and
 * a note, then said "you won't be charged yet" — nothing was committed on
 * either side and "request sent" was a dead end. This asks for the day, the
 * hours and what the traveler is actually into, prices it before they commit,
 * and ends on a confirmation with a reference code and concrete next steps.
 *
 * The design's middle QPay step is deliberately not built yet (no gateway is
 * wired), so the copy here confirms a *request* and never claims a payment.
 */
export function BookGuideDialog({ guide, trigger }: BookGuideDialogProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<1 | 2>(1)

  const [date, setDate] = React.useState<Date | undefined>()
  const [hours, setHours] = React.useState(DURATION_OPTIONS[1].hours)
  const [startTime, setStartTime] = React.useState(START_TIME_OPTIONS[1])
  const [interests, setInterests] = React.useState<string[]>([])
  const [note, setNote] = React.useState("")

  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [code, setCode] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const [blocked, setBlocked] = React.useState<Set<string>>(new Set())
  const [booked, setBooked] = React.useState<Set<string>>(new Set())

  // Fetch when the dialog opens, not on mount — a guide card that is never
  // clicked should cost nothing.
  React.useEffect(() => {
    if (!open) return
    const from = toDateKey(new Date())
    const end = new Date()
    end.setMonth(end.getMonth() + MAX_MONTHS_AHEAD)
    let cancelled = false

    fetch(`/api/guides/${guide.id}/availability?from=${from}&to=${toDateKey(end)}`)
      .then((r) => (r.ok ? r.json() : { blocked: [], booked: [] }))
      .then((d: { blocked: string[]; booked: string[] }) => {
        if (cancelled) return
        setBlocked(new Set(d.blocked))
        setBooked(new Set(d.booked))
      })
      .catch(() => {
        // Availability unknown → calendar stays open; the API guard still
        // rejects an unavailable date on submit.
      })

    return () => {
      cancelled = true
    }
  }, [open, guide.id])

  const rate = guide.price ?? 0
  const { subtotal, serviceFee, total } = quoteBooking(rate, hours)
  const endTime = addHours(startTime, hours)

  function reset() {
    setStep(1)
    setDate(undefined)
    setHours(DURATION_OPTIONS[1].hours)
    setStartTime(START_TIME_OPTIONS[1])
    setInterests([])
    setNote("")
    setError(null)
    setCode(null)
    setCopied(false)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  function toggleInterest(tag: string) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  async function submit() {
    if (!date) {
      setError("Аяллын өдрөө сонгоно уу.")
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      // POST /api/bookings/checkout takes a hold and returns a Wire checkout URL
      const res = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: guide.id,
          tripDate: toDateKey(date),
          hours,
          startTime,
          interests,
          city: guide.location || null,
          note: note || null,
        }),
      })

      if (res.status === 401) {
        const back = guide.slug ? `/guides/${guide.slug}` : "/guides"
        router.push(`/login?redirectTo=${encodeURIComponent(back)}`)
        return
      }
      if (!res.ok) {
        setError("Захиалга илгээхэд алдаа гарлаа. Дахин оролдоно уу.")
        return
      }

      const data = await res.json().catch(() => ({}))
      setCode(data.code ?? null)
      // Redirect to Wire checkout. The traveler pays, then returns to /booking/{id}
      // The webhook confirms the payment server-side, so the booking may not be
      // confirmed immediately on return — that's what the confirmation page checks.
      if (data.url) {
        window.location.href = data.url
        return
      }
      setStep(2)
    } catch {
      setError("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setSubmitting(false)
    }
  }

  async function copyCode() {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked — the code is on screen to read anyway
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="reserve" className="h-auto w-full rounded-[14px] p-[13px] text-[14.5px]">
            Хөтөч захиалах · {yen(rate)}/цаг
          </Button>
        )}
      </DialogTrigger>

      {/* dvh, not vh: mobile browser chrome makes vh overshoot, which would push
          the header and the submit button outside a fixed, centred dialog. */}
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-[820px]">
        {/* ── guide header ── */}
        <DialogHeader className="space-y-0 border-b border-border px-5 py-4 text-left">
          <div className="flex items-start gap-3">
            {guide.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={guide.image}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tint-sky text-[11px] font-bold text-sky-700">
                {initials(guide.name)}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <DialogTitle className="flex items-center gap-1.5 text-[15px] font-bold">
                {guide.name}
                {guide.is_verified && (
                  <span
                    aria-label="Баталгаажсан хөтөч"
                    className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white"
                  >
                    ✓
                  </span>
                )}
              </DialogTitle>
              <p className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <Star className="h-3 w-3 fill-saffron text-saffron" />
                {guide.rating} ({guide.review_count})
                {guide.location && ` · ${guide.location}`}
              </p>
              {guide.bio && (
                <DialogDescription className="mt-1 line-clamp-2 text-[12px] italic text-muted-foreground">
                  “{guide.bio}”
                </DialogDescription>
              )}
            </div>

            <div className="shrink-0 pr-6 text-right">
              <p className="font-display text-[16px] font-extrabold text-foreground">
                {yen(rate)}
              </p>
              <p className="text-[11px] text-muted-foreground">/цаг</p>
            </div>
          </div>

          {/* ── stepper ── */}
          <ol className="mt-4 flex items-center gap-2">
            {["Дэлгэрэнгүй", "Баталгаа"].map((label, i) => {
              const n = (i + 1) as 1 | 2
              const done = step > n
              const active = step === n
              return (
                <li key={label} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      done || active
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : n}
                  </span>
                  <span
                    className={cn(
                      "text-[11.5px] font-medium",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                  {i === 0 && <span className="h-px flex-1 bg-border" />}
                </li>
              )
            })}
          </ol>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_260px]">
            {/* ── left: the ask ── */}
            <div className="space-y-5">
              <div>
                <FieldLabel>Өдөр сонгох</FieldLabel>
                <div className="rounded-thumb border border-border p-2">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(day: Date) =>
                      resolveDayState(toDateKey(day), {
                        today: toDateKey(new Date()),
                        blocked,
                        booked,
                      }) !== "available"
                    }
                    locale={mn}
                    weekStartsOn={1}
                    // date-fns' mn locale still captions in English here, and the
                    // design wants "2026 · 7-р сар" regardless.
                    formatters={{
                      formatCaption: (month: Date) =>
                        `${month.getFullYear()} · ${month.getMonth() + 1}-р сар`,
                    }}
                    className="w-full"
                  />
                </div>
                <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-primary" />
                    Сонгосон
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-muted" />
                    Боломжгүй
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-saffron" />
                    Захиалгатай
                  </span>
                </div>
              </div>

              <div>
                <FieldLabel>Хугацаа</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.hours}
                      selected={hours === opt.hours}
                      onClick={() => setHours(opt.hours)}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <label
                    htmlFor="bgd-start"
                    className="text-[12px] text-muted-foreground"
                  >
                    эхлэх
                  </label>
                  <select
                    id="bgd-start"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-well border border-border bg-card px-2.5 py-1.5 text-[13px] font-semibold text-foreground"
                  >
                    {START_TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="text-[12.5px] text-muted-foreground">→ {endTime}</span>
                </div>
              </div>

              <div>
                <FieldLabel>Гол сонирхол</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((tag) => {
                    const on = interests.includes(tag)
                    return (
                      <Chip key={tag} selected={on} onClick={() => toggleInterest(tag)}>
                        {on && <Check className="mr-1 inline h-3 w-3" />}
                        {tag}
                      </Chip>
                    )
                  })}
                </div>
              </div>

              <div>
                <FieldLabel>
                  Хөтөчид үлдээх тэмдэглэл{" "}
                  <span className="font-normal normal-case tracking-normal">(сонголтоор)</span>
                </FieldLabel>
                <Textarea
                  value={note}
                  maxLength={NOTE_MAX_LENGTH}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Хоёр хүн, 5 настай хүүхэдтэй. Их хөдөлгөөнгүй байвал сайн…"
                  rows={3}
                  className="resize-none text-[13px]"
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {note.length}/{NOTE_MAX_LENGTH}
                </p>
              </div>
            </div>

            {/* ── right: the price ── */}
            {/* Phones get a condensed, sticky version: one calc line, the total
                and the CTA, so the price and the commit button stay on screen
                while scrolling the form. Desktop keeps the full breakdown. */}
            <aside className="sticky bottom-0 -mx-5 -mb-5 h-fit border-t border-border bg-card p-4 md:static md:mx-0 md:mb-0 md:rounded-thumb md:border md:bg-muted/40">
              <div className="hidden md:block">
                <FieldLabel>Захиалгын хураангуй</FieldLabel>
              </div>

              <dl className="hidden space-y-2 text-[12.5px] md:block">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">Өдөр</dt>
                  <dd className="text-right font-semibold text-foreground">
                    {date ? formatMnDay(toDateKey(date)) : "—"}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">Цаг</dt>
                  <dd className="font-semibold text-foreground">
                    {startTime} – {endTime}
                  </dd>
                </div>
              </dl>

              <div className="my-3 hidden h-px bg-border md:block" />

              <dl className="hidden space-y-2 text-[12.5px] md:block">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">
                    {yen(rate)} × {hours} ц
                  </dt>
                  <dd className="font-semibold text-foreground">{yen(subtotal)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">Үйлчилгээний хураамж</dt>
                  <dd className="font-semibold text-foreground">{yen(serviceFee)}</dd>
                </div>
              </dl>

              <div className="my-3 hidden h-px bg-border md:block" />

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-muted-foreground">
                  <span className="md:hidden">
                    {yen(rate)} × {hours} ц + үйлчилгээ
                  </span>
                  <span className="hidden md:inline">Нийт</span>
                </span>
                <span className="font-display text-[19px] font-extrabold text-foreground">
                  {yen(total)}
                </span>
              </div>

              {error && <p className="mt-3 text-[12px] text-destructive">{error}</p>}

              <Button
                variant="message"
                onClick={submit}
                disabled={submitting || !date}
                className="mt-4 w-full"
              >
                {submitting ? "Илгээж байна…" : "Захиалга илгээх"}
              </Button>
              <p className="mt-2 hidden text-center text-[11px] leading-snug text-muted-foreground md:block">
                Одоо төлбөр авахгүй. {guide.name} баталгаажуулсны дараа төлнө.
              </p>
            </aside>
          </div>
        ) : (
          /* ── step 2: confirmation ── */
          <div className="p-5">
            <div className="rounded-card bg-gradient-to-br from-sky-900 to-sky-700 px-5 py-6 text-center">
              <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Check className="h-5 w-5 text-white" />
              </span>
              <p className="font-display text-[19px] font-extrabold text-white">
                Захиалга илгээгдлээ
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-white/70">
                {guide.name} таны хүсэлтийг хүлээн авлаа. Баталгаажуулсны дараа төлбөрийн
                мэдээллийг илгээнэ — одоогоор ямар нэг төлбөр аваагүй.
              </p>
            </div>

            {code && (
              <div className="mt-4 flex items-center justify-between rounded-thumb border border-border px-4 py-3">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Захиалгын код
                  </p>
                  <p className="font-mono text-[15px] font-bold text-foreground">{code}</p>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label="Кодыг хуулах"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}

            <div className="mt-5">
              <FieldLabel>Дараа юу болох</FieldLabel>
              <ol className="space-y-3">
                {[
                  {
                    title: `${guide.name} баталгаажуулахыг хүлээж байна`,
                    sub: "Ихэвчлэн 24 цагийн дотор хариу өгдөг.",
                    active: true,
                  },
                  {
                    title: "Уулзах цэг тохирох",
                    sub: "Чатаар шууд ярилцана.",
                    active: false,
                  },
                  {
                    title: date
                      ? `${formatMnDay(toDateKey(date))} · ${startTime}-д уулзана`
                      : "Уулзалтын өдөр",
                    sub: `${hours} цаг · ${yen(total)}`,
                    active: false,
                  },
                ].map((s) => (
                  <li key={s.title} className="flex gap-3">
                    <span
                      className={cn(
                        "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                        s.active ? "bg-primary" : "bg-border"
                      )}
                    />
                    <div>
                      <p
                        className={cn(
                          "text-[13px] font-semibold",
                          s.active ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {s.title}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground">{s.sub}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/account/messages">
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Хөтөчтэй чатлах
                </Link>
              </Button>
              <Button variant="message" onClick={() => handleOpenChange(false)} className="flex-1">
                Хаах
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
