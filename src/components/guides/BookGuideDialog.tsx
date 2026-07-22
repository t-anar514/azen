"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { GuideRow } from "@/lib/supabase/types"

interface BookGuideDialogProps {
  guide: GuideRow
  /** Custom trigger (e.g. the mobile compact CTA). Defaults to the full-copy saffron button. */
  trigger?: React.ReactNode
}

/** Booking request dialog (design doc, Screen 12 — saffron "Хөтөч захиалах" CTA). */
export function BookGuideDialog({ guide, trigger }: BookGuideDialogProps) {
  const router = useRouter()
  const [city, setCity] = React.useState(guide.location ?? "")
  const [tripDate, setTripDate] = React.useState("")
  const [hours, setHours] = React.useState(3)
  const [note, setNote] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)

  const price = guide.price ?? 0
  const amount = React.useMemo(() => price * (Number(hours) || 0), [price, hours])

  function handleOpenChange(next: boolean) {
    if (next) {
      setError(null)
      setSent(false)
    }
  }

  async function handleSubmit() {
    if (!tripDate) {
      setError("Аяллын огноог сонгоно уу.")
      return
    }
    if (!hours || hours <= 0) {
      setError("Цагийн тоог зөв оруулна уу.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/guides/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: guide.id,
          tripDate,
          hours,
          city: city || null,
          note: note || null,
        }),
      })

      if (res.status === 401) {
        router.push(guide.slug ? `/login?redirectTo=/guides/${guide.slug}` : "/login?redirectTo=/guides")
        return
      }
      if (!res.ok) {
        setError("Хүсэлт илгээхэд алдаа гарлаа. Дахин оролдоно уу.")
        return
      }

      setSent(true)
    } catch {
      setError("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="reserve" className="h-auto w-full rounded-[14px] p-[13px] text-[14.5px]">
            Хөтөч захиалах · ¥{price.toLocaleString()}/цаг
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{guide.name}-г захиалах</DialogTitle>
          <DialogDescription>
            Хүсэлт илгээснээр төлбөр авахгүй — хөтөч эхлээд баталгаажуулна.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-2 py-2">
            <p className="text-sm font-semibold text-foreground">Хүсэлт илгээгдлээ</p>
            <p className="text-sm text-muted-foreground">
              {guide.name} тантай удахгүй холбогдож баталгаажуулна.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="bgd-city">Хот</Label>
                <Input
                  id="bgd-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Киото"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="bgd-date">Огноо</Label>
                  <Input
                    id="bgd-date"
                    type="date"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bgd-hours">Цаг</Label>
                  <Input
                    id="bgd-hours"
                    type="number"
                    min={1}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bgd-note">Тэмдэглэл (заавал биш)</Label>
                <Textarea
                  id="bgd-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Сонирхож буй зүйлээ бичээрэй…"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-well bg-muted px-4 py-3">
                <span className="text-sm font-semibold text-muted-foreground">Нийт дүн</span>
                <span className="font-display text-lg font-extrabold text-foreground">
                  ¥{amount.toLocaleString()}
                </span>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                variant="reserve"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Илгээж байна…" : "Хүсэлт илгээх"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
