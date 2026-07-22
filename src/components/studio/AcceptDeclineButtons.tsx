"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AcceptDeclineButtonsProps {
  id: string
  /** Stretch both buttons to fill the row (mobile "Шинэ хүсэлт" card). */
  fullWidth?: boolean
}

/**
 * Зөвшөөрөх (saffron, commit) / Татгалзах (outline) for a pending
 * guide_bookings row. Optimistic: buttons disable + relabel immediately on
 * click; success calls router.refresh() (the pending list re-fetches server
 * side and the row naturally drops out); failure reverts the buttons and
 * shows an inline error so the guide can retry.
 */
export function AcceptDeclineButtons({ id, fullWidth }: AcceptDeclineButtonsProps) {
  const router = useRouter()
  const [pending, setPending] = React.useState<"confirmed" | "declined" | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function act(status: "confirmed" | "declined") {
    setError(null)
    setPending(status)
    try {
      const res = await fetch("/api/guides/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      router.refresh()
    } catch {
      setPending(null)
      setError("Алдаа гарлаа. Дахин оролдоно уу.")
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn("flex gap-1.5", fullWidth && "w-full")}>
        <Button
          type="button"
          size="sm"
          variant="reserve"
          disabled={pending !== null}
          onClick={() => act("confirmed")}
          className={cn("rounded-pill", fullWidth && "flex-1")}
        >
          {pending === "confirmed" ? "Түр хүлээнэ үү…" : "Зөвшөөрөх"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending !== null}
          onClick={() => act("declined")}
          className={cn("rounded-pill", fullWidth && "flex-1")}
        >
          {pending === "declined" ? "Түр хүлээнэ үү…" : "Татгалзах"}
        </Button>
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
