"use client"

import * as React from "react"
import NextImage from "next/image"
import { Link } from "@/i18n/routing"
import { ArrowLeft, Check, Clock, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { INTERESTS } from "@/lib/tours/generate"
import { track } from "@/lib/analytics"
import type { BudgetBand, TourPace, TourPrefs } from "@/lib/supabase/types"

const Image = NextImage as any

const PACES: { id: TourPace; label: string; hint: string }[] = [
  { id: "relaxed", label: "Тайван", hint: "Өдөрт 3 газар — яарахгүй, гүнзгий" },
  { id: "balanced", label: "Тэнцвэртэй", hint: "Өдөрт 4 газар — сонгодог хэмнэл" },
  { id: "packed", label: "Шахуу", hint: "Өдөрт 6 газар — бүгдийг багтаана" },
]

const BANDS: { id: BudgetBand; label: string; hint: string }[] = [
  { id: "budget", label: "Хэмнэлттэй", hint: "Гудамжны хоол, үнэгүй үзвэр" },
  { id: "mid", label: "Дунд", hint: "Сайн ресторан, музейн тасалбар" },
  { id: "premium", label: "Тансаг", hint: "Кайсэки, хувийн хөтөч" },
]

interface PreviewStop {
  order: number
  place_id: string
  title: string
  note: string
  duration_min: number
  cover_image: string | null
}

interface MatchedGuide {
  id: string
  name: string
  image: string | null
  rating: number
  location: string | null
}

interface TourWizardProps {
  cities: { id: string; name: string }[]
}

const TOTAL_STEPS = 4

export function TourWizard({ cities }: TourWizardProps) {
  const [step, setStep] = React.useState(0)
  const [cityId, setCityId] = React.useState(cities[0]?.id ?? "")
  const [pace, setPace] = React.useState<TourPace>("balanced")
  const [interests, setInterests] = React.useState<string[]>([])
  const [groupSize, setGroupSize] = React.useState(2)
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [band, setBand] = React.useState<BudgetBand>("mid")

  const [preview, setPreview] = React.useState<{ itinerary: PreviewStop[]; matched_guide: MatchedGuide | null } | null>(null)
  const [email, setEmail] = React.useState("")
  const [name, setName] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [submitted, setSubmitted] = React.useState(false)

  const prefs: TourPrefs = {
    pace,
    interests,
    group_size: groupSize,
    date_from: dateFrom || null,
    date_to: dateTo || null,
    budget_band: band,
  }

  function toggleInterest(id: string) {
    setInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  async function buildPreview() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/tours/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city_id: cityId, prefs }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? "Төлөвлөгөө үүсгэж чадсангүй.")
      setPreview(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.")
    }
    setBusy(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city_id: cityId,
          prefs,
          contact_email: email,
          contact_name: name,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? "Илгээж чадсангүй.")
      track("tour_request_submitted", { city_id: cityId, pace, interests: interests.join(","), group_size: groupSize })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.")
    }
    setBusy(false)
  }

  // ---- result ----------------------------------------------------------
  if (submitted) {
    return (
      <div className="mx-auto max-w-xl rounded-card border border-border bg-card p-10 text-center space-y-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-tint-sage">
          <Check className="size-6 text-success" />
        </div>
        <h2 className="font-display text-2xl font-bold">Хүсэлт хүлээн авлаа</h2>
        <p className="text-muted-foreground">
          Манай баг таны төлөвлөгөөг хянаж, тохирох хөтөчтэй холбоод <strong>{email}</strong> хаяг руу
          24 цагийн дотор хариу илгээнэ.
        </p>
        <Button asChild variant="outline" className="rounded-pill">
          <Link href="/">Нүүр хуудас руу</Link>
        </Button>
      </div>
    )
  }

  // ---- generated itinerary + contact ----------------------------------
  if (preview) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <button
          type="button"
          onClick={() => setPreview(null)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Сонголтоо өөрчлөх
        </button>

        <div className="rounded-card border border-border bg-card overflow-hidden">
          <div className="border-b border-border p-6">
            <p className="text-eyebrow">Таны өдрийн төлөвлөгөө</p>
            <h2 className="mt-1 font-display text-2xl font-bold">
              {cities.find((c) => c.id === cityId)?.name} · {preview.itinerary.length} зогсоол
            </h2>
          </div>

          <ol className="divide-y divide-border">
            {preview.itinerary.map((stop) => (
              <li key={stop.place_id} className="flex items-center gap-4 p-4">
                <span className="w-6 shrink-0 text-center font-display text-lg font-extrabold text-primary/30">
                  {stop.order}
                </span>
                <div className="relative size-16 shrink-0 overflow-hidden rounded-thumb bg-muted">
                  {stop.cover_image ? (
                    <Image src={stop.cover_image} alt={stop.title} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{stop.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{stop.note}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> {stop.duration_min}м
                </span>
              </li>
            ))}
          </ol>

          {preview.matched_guide && (
            <div className="flex items-center gap-3 border-t border-border bg-tint-sky/40 p-4">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
                {preview.matched_guide.image ? (
                  <Image src={preview.matched_guide.image} alt={preview.matched_guide.name} fill className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Санал болгож буй хөтөч: {preview.matched_guide.name}
                </p>
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3 fill-saffron-600 text-saffron-600" />
                  {preview.matched_guide.rating} · {preview.matched_guide.location}
                </p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-card border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tour-name">Таны нэр</Label>
              <Input id="tour-name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-pill" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tour-email">Имэйл</Label>
              <Input
                id="tour-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-pill"
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" className="rounded-pill" onClick={() => setPreview(null)}>
              Өөрчлөх
            </Button>
            <Button type="submit" variant="reserve" className="rounded-pill" disabled={busy || !email.trim()}>
              {busy ? "Илгээж байна…" : "Захиалга илгээх"}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  // ---- wizard steps ----------------------------------------------------
  const canAdvance =
    step === 0 ? !!cityId : step === 1 ? interests.length > 0 : step === 2 ? groupSize > 0 : true

  return (
    <div className="mx-auto max-w-xl space-y-8">
      {/* progress dots */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-pill transition-all",
              i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-border"
            )}
          />
        ))}
      </div>

      <div className="min-h-[19rem] space-y-6">
        {step === 0 && (
          <StepShell
            title="Хаашаа, ямар хэмнэлтэй явах вэ?"
            hint="Өдрийн ачааллаа сонгоно уу."
          >
            <div className="space-y-2">
              <Label htmlFor="tour-city">Хот</Label>
              <select
                id="tour-city"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="h-11 w-full rounded-pill border border-input bg-card px-4 text-sm outline-none"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              {PACES.map((p) => (
                <ChoiceRow
                  key={p.id}
                  selected={pace === p.id}
                  onClick={() => setPace(p.id)}
                  label={p.label}
                  hint={p.hint}
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell title="Юу сонирхдог вэ?" hint="Хэд ч сонгож болно.">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={cn(
                    "rounded-pill border px-4 py-2 text-sm font-semibold transition-colors",
                    interests.includes(interest.id)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  )}
                >
                  {interest.label}
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Хэдүүлээ, хэзээ?" hint="Огноо заавал биш.">
            <div className="space-y-2">
              <Label htmlFor="tour-group">Хүний тоо</Label>
              <Input
                id="tour-group"
                type="number"
                min={1}
                max={30}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="rounded-pill"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tour-from">Эхлэх</Label>
                <Input id="tour-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-pill" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tour-to">Дуусах</Label>
                <Input id="tour-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-pill" />
              </div>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="Төсвийн түвшин?" hint="Санал болгох газруудыг үүнд тааруулна.">
            <div className="grid gap-2">
              {BANDS.map((b) => (
                <ChoiceRow
                  key={b.id}
                  selected={band === b.id}
                  onClick={() => setBand(b.id)}
                  label={b.label}
                  hint={b.hint}
                />
              ))}
            </div>
          </StepShell>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          className="rounded-pill"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          Буцах
        </Button>
        {step < TOTAL_STEPS - 1 ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-pill"
            disabled={!canAdvance}
            onClick={() => setStep((s) => s + 1)}
          >
            Үргэлжлүүлэх
          </Button>
        ) : (
          <Button type="button" variant="reserve" className="rounded-pill" disabled={busy} onClick={buildPreview}>
            {busy ? "Үүсгэж байна…" : "Төлөвлөгөө үүсгэх"}
          </Button>
        )}
      </div>
    </div>
  )
}

function StepShell({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      {children}
    </div>
  )
}

function ChoiceRow({
  selected,
  onClick,
  label,
  hint,
}: {
  selected: boolean
  onClick: () => void
  label: string
  hint: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
        selected ? "border-primary bg-secondary" : "border-border bg-card hover:bg-muted"
      )}
    >
      <span>
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      {selected && <Check className="size-4 shrink-0 text-primary" />}
    </button>
  )
}
