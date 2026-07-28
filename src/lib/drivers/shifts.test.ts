import { describe, expect, it } from "vitest"

import {
  addDays,
  capacityBand,
  driverRevealAt,
  driverStatus,
  statusTab,
  isDriverRevealed,
  isPickupBookable,
  isSlotBookable,
  isoWeekday,
  openDayCount,
  previewOpenWeeks,
  resolveSlotState,
  slotForHour,
  startOfWeek,
  summariseDays,
  weekStrip,
  type ShiftRow,
  type SlotAvailability,
} from "./shifts"

describe("slotForHour", () => {
  it("maps each six-hour window to its slot", () => {
    expect(slotForHour(6)).toBe("morning")
    expect(slotForHour(11)).toBe("morning")
    expect(slotForHour(12)).toBe("day")
    expect(slotForHour(17)).toBe("day")
    expect(slotForHour(18)).toBe("evening")
    expect(slotForHour(23)).toBe("evening")
  })

  it("leaves 00:00–06:00 unslotted", () => {
    // Not an oversight: a 03:00 airport run belongs to the previous evening's
    // shift, and inventing a fourth slot for it would make every driver's grid
    // a quarter longer for the rarest case.
    expect(slotForHour(0)).toBeNull()
    expect(slotForHour(5)).toBeNull()
  })
})

describe("date helpers", () => {
  it("treats date keys as local, not UTC", () => {
    // The bug this guards: toISOString() on local midnight in Asia/Tokyo yields
    // the *previous* day, which would open the wrong shift.
    expect(isoWeekday("2026-08-06")).toBe(4) // Thursday
    expect(isoWeekday("2026-08-09")).toBe(7) // Sunday
  })

  it("starts weeks on Monday", () => {
    expect(startOfWeek("2026-08-06")).toBe("2026-08-03")
    expect(startOfWeek("2026-08-03")).toBe("2026-08-03")
    expect(startOfWeek("2026-08-09")).toBe("2026-08-03")
  })

  it("crosses month and year boundaries", () => {
    expect(addDays("2026-07-31", 1)).toBe("2026-08-01")
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28")
  })
})

describe("previewOpenWeeks", () => {
  const template = [
    { weekday: 1, slot: "morning" as const },
    { weekday: 1, slot: "day" as const },
    { weekday: 4, slot: "morning" as const },
  ]

  it("stamps the template from tomorrow, not today", () => {
    // Today is half spent and its slots may already be past — 0025 starts at
    // +1 day and this preview has to promise the same thing.
    const { dates } = previewOpenWeeks(template, "2026-08-03", 1)
    expect(dates).not.toContain("2026-08-03")
    expect(dates[0]).toBe("2026-08-06") // the Thursday
  })

  it("counts slots, not days", () => {
    const { dates, slots } = previewOpenWeeks(template, "2026-08-03", 2)
    // Two Mondays (2 slots each) + two Thursdays (1 slot each).
    expect(dates).toHaveLength(4)
    expect(slots).toBe(6)
  })

  it("reports the last day of the horizon", () => {
    expect(previewOpenWeeks(template, "2026-08-03", 4).through).toBe("2026-08-31")
  })

  it("returns nothing for an empty template", () => {
    expect(previewOpenWeeks([], "2026-08-03", 4)).toMatchObject({ dates: [], slots: 0 })
  })
})

describe("resolveSlotState", () => {
  const row = (booked: number): ShiftRow => ({
    date: "2026-08-06",
    slot: "morning",
    capacity: 2,
    booked_count: booked,
  })

  it("treats a missing row as closed", () => {
    expect(resolveSlotState(undefined)).toBe("closed")
  })

  it("marks a sold slot booked so the UI cannot offer to close it", () => {
    // Mirrors the DELETE policy in 0025, which refuses booked_count > 0.
    expect(resolveSlotState(row(1))).toBe("booked")
    expect(resolveSlotState(row(0))).toBe("open")
  })
})

describe("weekStrip", () => {
  it("renders one cell per day with booked winning over open", () => {
    const rows: ShiftRow[] = [
      { date: "2026-08-03", slot: "morning", capacity: 1, booked_count: 0 },
      { date: "2026-08-04", slot: "morning", capacity: 1, booked_count: 0 },
      { date: "2026-08-04", slot: "day", capacity: 1, booked_count: 1 },
      { date: "2026-08-06", slot: "evening", capacity: 1, booked_count: 0 },
    ]
    expect(weekStrip(rows, "2026-08-03")).toEqual([
      "open", "booked", null, "open", null, null, null,
    ])
  })
})

describe("openDayCount", () => {
  it("counts distinct days, not rows, and ignores days outside the window", () => {
    const rows: ShiftRow[] = [
      { date: "2026-08-03", slot: "morning", capacity: 1, booked_count: 0 },
      { date: "2026-08-03", slot: "day", capacity: 1, booked_count: 0 },
      { date: "2026-08-05", slot: "day", capacity: 1, booked_count: 0 },
      { date: "2026-09-01", slot: "day", capacity: 1, booked_count: 0 },
    ]
    expect(openDayCount(rows, "2026-08-03", 7)).toBe(2)
  })
})

describe("driverStatus", () => {
  const today = "2026-07-26"

  it("reads application state before schedule state", () => {
    expect(driverStatus({ verification_status: "pending", schedule_open_until: null }, today)).toBe("pending")
    expect(driverStatus({ verification_status: "rejected", schedule_open_until: "2026-09-01" }, today)).toBe("suspended")
  })

  it("separates approved-but-never-scheduled from active", () => {
    // The distinction the DB's three statuses cannot make, and the reason this
    // function exists: both of these are verification_status 'approved'.
    expect(driverStatus({ verification_status: "approved", schedule_open_until: null }, today)).toBe("unscheduled")
    expect(driverStatus({ verification_status: "approved", schedule_open_until: "2026-08-24" }, today)).toBe("active")
  })

  it("warns before a schedule runs out and after it has", () => {
    expect(driverStatus({ verification_status: "approved", schedule_open_until: "2026-07-28" }, today)).toBe("expiring")
    expect(driverStatus({ verification_status: "approved", schedule_open_until: "2026-08-02" }, today)).toBe("expiring")
    expect(driverStatus({ verification_status: "approved", schedule_open_until: "2026-08-03" }, today)).toBe("active")
    expect(driverStatus({ verification_status: "approved", schedule_open_until: "2026-07-25" }, today)).toBe("lapsed")
  })

  it("files every non-pending, non-suspended driver under the active tab", () => {
    expect(statusTab("unscheduled")).toBe("active")
    expect(statusTab("lapsed")).toBe("active")
    expect(statusTab("pending")).toBe("pending")
    expect(statusTab("suspended")).toBe("suspended")
  })
})

describe("capacityBand", () => {
  it("separates a full day from a day nobody opened", () => {
    // The calendar draws "Дүүрэн" and "closed" differently; collapsing them
    // would tell a traveler to abandon a date that only needs another slot.
    expect(capacityBand(0, 0)).toBe("none")
    expect(capacityBand(0, 5)).toBe("full")
  })

  it("flags scarcity below the threshold", () => {
    expect(capacityBand(2, 8)).toBe("scarce")
    expect(capacityBand(3, 8)).toBe("plenty")
  })
})

describe("summariseDays", () => {
  const rows: SlotAvailability[] = [
    { date: "2026-08-06", slot: "morning", vehicles_open: 4, vehicles_left: 4 },
    { date: "2026-08-06", slot: "day", vehicles_open: 3, vehicles_left: 2 },
    { date: "2026-08-06", slot: "evening", vehicles_open: 2, vehicles_left: 0 },
    { date: "2026-08-08", slot: "morning", vehicles_open: 2, vehicles_left: 0 },
  ]

  it("totals a day while keeping the slot breakdown", () => {
    const day = summariseDays(rows).get("2026-08-06")!
    expect(day.vehiclesOpen).toBe(9)
    expect(day.vehiclesLeft).toBe(6)
    expect(day.band).toBe("plenty")
    expect(day.bySlot.evening.band).toBe("full")
    expect(day.bySlot.day.band).toBe("scarce")
  })

  it("reports a fully sold day as full, not closed", () => {
    expect(summariseDays(rows).get("2026-08-08")!.band).toBe("full")
  })

  it("leaves untouched slots at zero", () => {
    const day = summariseDays(rows).get("2026-08-08")!
    expect(day.bySlot.evening).toEqual({ open: 0, left: 0, band: "none" })
  })
})

describe("isSlotBookable", () => {
  const capacity = { open: 4, left: 2 }

  it("keeps a window open while any of it is still far enough away", () => {
    // 05:00 on the day of a 06:00–12:00 slot: the window has hours left in it,
    // so hiding it would conceal capacity that exists.
    const now = new Date(2026, 7, 6, 5, 0)
    expect(isSlotBookable(capacity, { date: "2026-08-06", slot: "morning", now })).toBe(true)
  })

  it("closes a window whose end is inside the notice period", () => {
    const now = new Date(2026, 7, 6, 11, 30)
    expect(isSlotBookable(capacity, { date: "2026-08-06", slot: "morning", now })).toBe(false)
  })

  it("refuses a sold-out or unopened slot regardless of timing", () => {
    const now = new Date(2026, 7, 1, 9, 0)
    expect(isSlotBookable({ open: 4, left: 0 }, { date: "2026-08-06", slot: "day", now })).toBe(false)
    expect(isSlotBookable(undefined, { date: "2026-08-06", slot: "day", now })).toBe(false)
  })
})

describe("isPickupBookable", () => {
  it("enforces the notice window against the actual pickup", () => {
    const now = new Date(2026, 7, 6, 6, 0)
    expect(isPickupBookable(new Date(2026, 7, 6, 9, 0).toISOString(), { now })).toBe(true)
    expect(isPickupBookable(new Date(2026, 7, 6, 7, 0).toISOString(), { now })).toBe(false)
  })

  it("rejects unparseable input rather than defaulting to bookable", () => {
    expect(isPickupBookable("not a date")).toBe(false)
  })
})

describe("driver reveal", () => {
  it("unlocks the driver two hours before pickup", () => {
    const pickup = new Date(2026, 7, 6, 7, 40).toISOString()
    expect(driverRevealAt(pickup).getHours()).toBe(5)
    expect(driverRevealAt(pickup).getMinutes()).toBe(40)
  })

  it("prefers the stored reveal time over recomputing it", () => {
    // driver_visible_at is pinned at assignment (0025) so a later change to the
    // driver's notice preference cannot move a time the traveler was promised.
    const booking = {
      pickup_datetime: new Date(2026, 7, 6, 7, 40).toISOString(),
      driver_visible_at: new Date(2026, 7, 6, 3, 40).toISOString(),
    }
    expect(isDriverRevealed(booking, new Date(2026, 7, 6, 4, 0))).toBe(true)
    expect(isDriverRevealed(booking, new Date(2026, 7, 6, 3, 0))).toBe(false)
  })

  it("falls back to pickup minus notice when the column is null", () => {
    const booking = {
      pickup_datetime: new Date(2026, 7, 6, 7, 40).toISOString(),
      driver_visible_at: null,
    }
    expect(isDriverRevealed(booking, new Date(2026, 7, 6, 5, 0))).toBe(false)
    expect(isDriverRevealed(booking, new Date(2026, 7, 6, 6, 0))).toBe(true)
  })
})
