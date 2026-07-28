"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

/**
 * "Цуцлах" for a confirmed `guide_bookings` row.
 *
 * Replaces the old accept/decline pair: under pay-upfront the traveler has
 * already paid by the time a guide sees the booking, so there is nothing to
 * approve. Cancelling frees the date so someone else can book it.
 *
 * Azen does not refund, so this does not move money and must not imply it —
 * cancelling a paid trip is a conversation with the traveler, not a button that
 * settles up. Two-step on purpose for the same reason.
 */
export function CancelBookingButton({ id }: { id: string }) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [confirming, setConfirming] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function act() {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch("/api/guides/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "cancelled" }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setConfirming(false)
      startTransition(() => router.refresh())
    } catch {
      setError("Алдаа гарлаа.")
    } finally {
      setBusy(false)
    }
  }

  const disabled = busy || isPending

  if (!confirming) {
    return (
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => setConfirming(true)}
          className="rounded-pill text-muted-foreground hover:text-destructive"
        >
          Цуцлах
        </Button>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <p className="text-[11px] text-muted-foreground">
        Цуцлах уу? Тухайн өдөр дахин захиалгад нээгдэнэ.
      </p>
      <div className="flex gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => setConfirming(false)}
          className="rounded-pill"
        >
          Болих
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={disabled}
          onClick={act}
          className="rounded-pill"
        >
          {busy ? "Түр хүлээнэ үү…" : "Тийм, цуцлах"}
        </Button>
      </div>
      {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  )
}
