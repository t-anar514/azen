import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getStudioContext } from "@/lib/studio/context"
import {
  loadDriverShifts,
  loadDriverTemplate,
  todayKey,
  topUpSchedule,
} from "@/lib/drivers/scheduleData"
import { addDays, slotForDatetime, startOfWeek, type ShiftSlot } from "@/lib/drivers/shifts"
import {
  DriverScheduleScreen,
  type DriverScheduleStats,
} from "@/components/studio/driver/DriverScheduleScreen"
import type { DayJob } from "@/components/studio/driver/ScheduleCalendar"
import type { BookingRow } from "@/lib/supabase/types"

export const metadata = { title: "Хуваарь | Azen Studio" }
export const dynamic = "force-dynamic"

/** How far the calendar can be paged without another fetch. */
const HORIZON_DAYS = 120

/** Slots are six hours; a job inside one is costed at that for the week total. */
const HOURS_PER_SLOT = 6

function timeLabel(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function dateKeyOf(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
}

export default async function DriverSchedulePage() {
  const context = await getStudioContext()
  // A guide reaching this URL has no shifts to edit — send them to the part of
  // the studio that is theirs rather than rendering an empty driver screen.
  if (!context) redirect("/login?redirectTo=/studio/schedule")
  if (context.kind !== "driver") redirect("/studio")

  const { driver } = context
  const today = todayKey()

  // Runs before the reads so a topped-up horizon is visible on this very render
  // rather than one refresh later.
  await topUpSchedule(driver)

  const supabase = await createClient()
  const windowStart = startOfWeek(today)
  const windowEnd = addDays(today, HORIZON_DAYS)

  const [template, shifts, { data: bookingRows }, { data: freshDriver }] = await Promise.all([
    loadDriverTemplate(driver.id),
    loadDriverShifts(driver.id, windowStart, windowEnd),
    supabase
      .from("bookings")
      .select("*")
      .eq("driver_id", driver.id)
      .in("status", ["assigned", "en_route", "arrived", "picked_up", "completed"])
      .gte("pickup_datetime", `${windowStart}T00:00:00`)
      .order("pickup_datetime"),
    // topUpSchedule may have moved schedule_open_until; re-read so the header
    // and the sidebar countdown agree with what was just written.
    supabase.from("drivers").select("*").eq("id", driver.id).single(),
  ])

  const bookings = (bookingRows ?? []) as BookingRow[]

  const jobs: DayJob[] = bookings.map((b) => ({
    id: b.id,
    date: b.shift_date ?? dateKeyOf(b.pickup_datetime),
    slot: (b.shift_slot ?? slotForDatetime(b.pickup_datetime)) as ShiftSlot | null,
    time: timeLabel(b.pickup_datetime),
    title: `${b.pickup_location} → ${b.dropoff_location}`,
    subtitle: `${b.flight_number} · ${b.guest_name}`,
    price: `₮${new Intl.NumberFormat("mn-MN").format(Number(b.price))}`,
  }))

  const weekStart = startOfWeek(today)
  const weekEnd = addDays(weekStart, 6)
  const thisWeek = jobs.filter((j) => j.date >= weekStart && j.date <= weekEnd)

  const monthPrefix = today.slice(0, 7)
  const monthEarnings = bookings
    .filter((b) => b.status === "completed" && dateKeyOf(b.pickup_datetime).startsWith(monthPrefix))
    .reduce((sum, b) => sum + Number(b.price), 0)

  const upcomingShifts = shifts.filter((s) => s.date >= today)

  const stats: DriverScheduleStats = {
    jobsThisWeek: thisWeek.length,
    hoursThisWeek: thisWeek.length * HOURS_PER_SLOT,
    openSlots: upcomingShifts.length,
    bookedSlots: upcomingShifts.filter((s) => s.booked_count > 0).length,
    monthEarnings,
    rating: null,
    tripCount: bookings.filter((b) => b.status === "completed").length,
  }

  return (
    <DriverScheduleScreen
      driver={freshDriver ?? driver}
      today={today}
      template={template}
      shifts={shifts}
      jobs={jobs}
      stats={stats}
    />
  )
}
