"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { Button } from "@/components/ui/button"
import type { BookingStatus } from "@/lib/supabase/types"

interface DriverOption {
  id: string
  full_name: string
}

interface TransferRowActionsProps {
  bookingId: string
  status: BookingStatus
  driverId: string | null
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | null
  drivers: DriverOption[]
}

const STATUS_OPTIONS: BookingStatus[] = [
  "pending_payment",
  "confirmed",
  "assigned",
  "en_route",
  "arrived",
  "picked_up",
  "completed",
  "cancelled",
]

export function TransferRowActions({
  bookingId,
  status,
  driverId,
  paymentStatus,
  drivers,
}: TransferRowActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)

  async function patch(body: Record<string, unknown>) {
    setBusy(true)
    await fetch(`/api/admin/transfers/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setBusy(false)
    router.refresh()
  }

  async function markPaid() {
    setBusy(true)
    await fetch(`/api/admin/transfers/${bookingId}/mark-paid`, { method: "POST" })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={driverId ?? ""}
        disabled={busy}
        onChange={(e) => patch({ driver_id: e.target.value || null })}
        className="border-input dark:bg-input/30 h-9 rounded-md border bg-transparent px-2 text-sm shadow-xs outline-none"
      >
        <option value="">— No driver —</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id}>
            {d.full_name}
          </option>
        ))}
      </select>

      <select
        value={status}
        disabled={busy}
        onChange={(e) => patch({ status: e.target.value })}
        className="border-input dark:bg-input/30 h-9 rounded-md border bg-transparent px-2 text-sm shadow-xs outline-none"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {paymentStatus !== "paid" && (
        <Button size="sm" disabled={busy} onClick={markPaid}>
          Mark paid
        </Button>
      )}
    </div>
  )
}
