import { NextResponse } from "next/server"

import { requireApprovedDriver } from "@/lib/supabase/requireDriver"
import { isShiftSlot, isValidDateKey, toDateKey } from "@/lib/drivers/shifts"

/**
 * `PATCH /api/driver/schedule/day` — open or close one slot on one day.
 *
 * Closing is a DELETE, because in an allowlist the absence of a row *is* the
 * closed state; there is no `is_open` flag to flip. The RLS policy on that
 * delete refuses any row with `booked_count > 0`, so a driver cannot vanish
 * from a ride somebody has already paid for — they have to cancel the job.
 * That refusal surfaces here as 0 rows affected, which is reported as a
 * conflict rather than a success.
 */
export async function PATCH(request: Request) {
  const guard = await requireApprovedDriver()
  if ("error" in guard) return guard.error
  const { supabase, driver } = guard

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const { date, slot } = body
  if (!isValidDateKey(date)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 })
  }
  if (!isShiftSlot(slot)) {
    return NextResponse.json({ error: "unknown slot" }, { status: 400 })
  }
  if (typeof body.open !== "boolean") {
    return NextResponse.json({ error: "open must be a boolean" }, { status: 400 })
  }

  // Editing the past changes nothing that can still be sold, and lets a stale
  // tab quietly write rows the calendar will never show.
  if (date < toDateKey(new Date())) {
    return NextResponse.json({ error: "Өнгөрсөн өдрийг засах боломжгүй." }, { status: 409 })
  }

  if (body.open) {
    const capacity = body.capacity == null ? 1 : Number(body.capacity)
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 8) {
      return NextResponse.json({ error: "capacity must be 1–8" }, { status: 400 })
    }

    const { error } = await supabase
      .from("driver_shifts")
      .upsert(
        { driver_id: driver.id, date, slot, capacity },
        { onConflict: "driver_id,date,slot", ignoreDuplicates: true }
      )
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ date, slot, open: true })
  }

  const { data, error } = await supabase
    .from("driver_shifts")
    .delete()
    .eq("driver_id", driver.id)
    .eq("date", date)
    .eq("slot", slot)
    .select("date")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data || data.length === 0) {
    // Either it was already closed, or it is booked and the policy refused.
    // Distinguishing the two is worth one extra read: only one of them is an
    // error the driver needs to see.
    const { data: existing } = await supabase
      .from("driver_shifts")
      .select("booked_count")
      .eq("driver_id", driver.id)
      .eq("date", date)
      .eq("slot", slot)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "Захиалагдсан ээлжийг хаах боломжгүй. Ажлаа цуцлана уу." },
        { status: 409 }
      )
    }
  }

  return NextResponse.json({ date, slot, open: false })
}
