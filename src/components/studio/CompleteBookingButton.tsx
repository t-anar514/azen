"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

/**
 * "Дуусгасан" action for a confirmed `guide_bookings` row (Task 4.7) — marks
 * a trip that has actually happened as completed, which is what feeds
 * `sumCompleted`/`earningsByMonth` on the Орлого page. Same optimistic
 * shape as `AcceptDeclineButtons`, single action instead of two.
 */
export function CompleteBookingButton({ id }: { id: string }) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function act() {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch("/api/guides/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "completed" }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      startTransition(() => router.refresh())
    } catch {
      setError("Алдаа гарлаа.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy || isPending}
        onClick={act}
        className="rounded-pill"
      >
        {busy ? "Түр хүлээнэ үү…" : "Дуусгасан"}
      </Button>
      {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  )
}
