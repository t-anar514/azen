"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { BookingStatus } from "@/lib/supabase/types"

interface JobStatusActionsProps {
  bookingId: string
  currentStatus: BookingStatus
}

// Only the transitions a driver should ever trigger themselves. Earlier
// stages (pending_payment -> confirmed -> assigned) and cancellation stay
// admin-only for this MVP.
const NEXT_STATUS: Partial<Record<BookingStatus, { status: BookingStatus; label: string }>> = {
  assigned: { status: "en_route", label: "Явж байна гэж тэмдэглэх" },
  en_route: { status: "arrived", label: "Ирсэн гэж тэмдэглэх" },
  arrived: { status: "picked_up", label: "Зорчигчийг авсан гэж тэмдэглэх" },
  picked_up: { status: "completed", label: "Аяллыг дуусгах" },
}

export function JobStatusActions({ bookingId, currentStatus }: JobStatusActionsProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const next = NEXT_STATUS[currentStatus]
  if (!next) return null

  async function handleAdvance(target: { status: BookingStatus; label: string }) {
    setUpdating(true)
    setError(null)

    // Direct RLS-governed update (bookings_update policy allows
    // driver_id = auth.uid() or an admin) — same direct-write pattern used
    // elsewhere in the app (planner, itineraries) instead of an API route.
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: target.status })
      .eq("id", bookingId)

    setUpdating(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.refresh()
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        className="bg-primary hover:bg-primary/90"
        disabled={updating}
        onClick={() => handleAdvance(next)}
      >
        {updating ? "Шинэчилж байна…" : next.label}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
