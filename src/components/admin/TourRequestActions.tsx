"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { TourRequestStatus } from "@/lib/supabase/types"

const selectClass =
  "border-input dark:bg-input/30 h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none"

const STATUSES: TourRequestStatus[] = ["draft", "requested", "matched", "confirmed", "declined"]

interface TourRequestActionsProps {
  id: string
  status: TourRequestStatus
  matchedGuideId: string | null
  guides: { id: string; name: string }[]
}

export function TourRequestActions({ id, status, matchedGuideId, guides }: TourRequestActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)

  async function patch(payload: Record<string, unknown>) {
    setBusy(true)
    await fetch(`/api/admin/tours/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={matchedGuideId ?? ""}
        disabled={busy}
        onChange={(e) => patch({ matched_guide_id: e.target.value, status: "matched" })}
        className={selectClass}
        aria-label="Matched guide"
      >
        <option value="">— no guide —</option>
        {guides.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      <select
        value={status}
        disabled={busy}
        onChange={(e) => patch({ status: e.target.value })}
        className={selectClass}
        aria-label="Status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <Button
        variant="outline"
        size="sm"
        disabled={busy || status === "confirmed"}
        onClick={() => patch({ status: "confirmed" })}
      >
        Confirm
      </Button>
    </div>
  )
}
