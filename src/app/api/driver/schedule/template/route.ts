import { NextResponse } from "next/server"

import { requireApprovedDriver } from "@/lib/supabase/requireDriver"
import { isShiftSlot, type ShiftSlot } from "@/lib/drivers/shifts"

interface CellInput {
  weekday: number
  slot: ShiftSlot
  capacity?: number
}

/** 7 weekdays × 3 slots. Anything longer is not a week. */
const MAX_CELLS = 21

/**
 * `PUT /api/driver/schedule/template` — replace the weekly stencil, and
 * optionally the two booking preferences that sit under it.
 *
 * Replace rather than patch: the editor is a 21-cell grid the driver submits
 * whole, so "these are my hours" is the actual intent. Diffing individual cells
 * would let a stale tab resurrect a slot the driver turned off.
 *
 * Editing the template deliberately does *not* touch already-opened days in
 * `driver_shifts`. Someone tightening their hours for next month must not
 * silently cancel a ride that is already sold for this Friday — that has to be
 * an explicit act on the day itself, which is what the calendar is for.
 */
export async function PUT(request: Request) {
  const guard = await requireApprovedDriver()
  if ("error" in guard) return guard.error
  const { supabase, driver } = guard

  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body.cells)) {
    return NextResponse.json({ error: "cells[] is required" }, { status: 400 })
  }
  if (body.cells.length > MAX_CELLS) {
    return NextResponse.json({ error: "too many cells" }, { status: 400 })
  }

  const seen = new Set<string>()
  const rows: { driver_id: string; weekday: number; slot: ShiftSlot; capacity: number }[] = []

  for (const raw of body.cells as CellInput[]) {
    const weekday = Number(raw?.weekday)
    if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
      return NextResponse.json({ error: "weekday must be 1–7" }, { status: 400 })
    }
    if (!isShiftSlot(raw?.slot)) {
      return NextResponse.json({ error: "unknown slot" }, { status: 400 })
    }
    const capacity = raw.capacity == null ? 1 : Number(raw.capacity)
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 8) {
      return NextResponse.json({ error: "capacity must be 1–8" }, { status: 400 })
    }

    // A duplicated cell would trip the composite PK mid-insert and leave the
    // driver with a half-written template, since the delete has already run.
    const key = `${weekday}:${raw.slot}`
    if (seen.has(key)) continue
    seen.add(key)

    rows.push({ driver_id: driver.id, weekday, slot: raw.slot, capacity })
  }

  const prefs: Record<string, number | boolean> = {}
  if (typeof body.autoExtend === "boolean") {
    prefs.schedule_auto_extend = body.autoExtend
  }
  if (body.minNoticeHours != null) {
    const n = Number(body.minNoticeHours)
    if (!Number.isInteger(n) || n < 0 || n > 72) {
      return NextResponse.json({ error: "minNoticeHours must be 0–72" }, { status: 400 })
    }
    prefs.min_notice_hours = n
  }
  if (body.maxJobsPerDay != null) {
    const n = Number(body.maxJobsPerDay)
    if (!Number.isInteger(n) || n < 1 || n > 24) {
      return NextResponse.json({ error: "maxJobsPerDay must be 1–24" }, { status: 400 })
    }
    prefs.max_jobs_per_day = n
  }

  const { error: clearError } = await supabase
    .from("driver_shift_templates")
    .delete()
    .eq("driver_id", driver.id)
  if (clearError) {
    return NextResponse.json({ error: clearError.message }, { status: 500 })
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("driver_shift_templates").insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (Object.keys(prefs).length > 0) {
    const { error } = await supabase.from("drivers").update(prefs).eq("id", driver.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ cells: rows.length })
}
