import { describe, it, expect } from "vitest"
import {
  resolveDayState,
  toDateKey,
  isValidDateKey,
  occupiesDate,
} from "./availability"

const opts = (blocked: string[] = [], booked: string[] = []) => ({
  today: "2026-07-25",
  blocked: new Set(blocked),
  booked: new Set(booked),
})

describe("resolveDayState", () => {
  it("returns past for a date before today", () => {
    expect(resolveDayState("2026-07-24", opts())).toBe("past")
  })
  it("treats today as available, not past", () => {
    expect(resolveDayState("2026-07-25", opts())).toBe("available")
  })
  it("returns available when nothing applies", () => {
    expect(resolveDayState("2026-08-01", opts())).toBe("available")
  })
  it("returns blocked when the guide blocked it", () => {
    expect(resolveDayState("2026-08-01", opts(["2026-08-01"]))).toBe("blocked")
  })
  it("returns booked when a confirmed booking exists", () => {
    expect(resolveDayState("2026-08-01", opts([], ["2026-08-01"]))).toBe("booked")
  })
  it("ranks booked above blocked so a sold day is never editable", () => {
    expect(
      resolveDayState("2026-08-01", opts(["2026-08-01"], ["2026-08-01"]))
    ).toBe("booked")
  })
  it("ranks past above everything", () => {
    expect(
      resolveDayState("2026-07-01", opts(["2026-07-01"], ["2026-07-01"]))
    ).toBe("past")
  })
  it("compares dates chronologically across month and year rollover", () => {
    const o = { today: "2026-12-31", blocked: new Set<string>(), booked: new Set<string>() }
    expect(resolveDayState("2027-01-01", o)).toBe("available")
    expect(resolveDayState("2026-12-30", o)).toBe("past")
  })
})

describe("toDateKey", () => {
  it("uses local calendar fields, not UTC", () => {
    // 2026-08-01T00:30 local must stay Aug 1 even in a UTC-behind zone
    expect(toDateKey(new Date(2026, 7, 1, 0, 30))).toBe("2026-08-01")
  })
  it("zero-pads month and day", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05")
  })
  it("handles the last instant of a day without rolling over", () => {
    expect(toDateKey(new Date(2026, 11, 31, 23, 59, 59))).toBe("2026-12-31")
  })
})

describe("isValidDateKey", () => {
  it("accepts a well-formed key", () => {
    expect(isValidDateKey("2026-08-01")).toBe(true)
  })
  it("rejects junk", () => {
    expect(isValidDateKey("2026-8-1")).toBe(false)
    expect(isValidDateKey("not-a-date")).toBe(false)
    expect(isValidDateKey(20260801)).toBe(false)
    expect(isValidDateKey(null)).toBe(false)
    expect(isValidDateKey(undefined)).toBe(false)
  })
  it("rejects a SQL-injection-shaped string", () => {
    expect(isValidDateKey("2026-08-01'; drop table guides;--")).toBe(false)
  })
})

describe("occupiesDate", () => {
  const NOW = Date.parse("2026-07-25T12:00:00Z")
  const future = new Date(NOW + 10 * 60_000).toISOString()
  const past = new Date(NOW - 10 * 60_000).toISOString()

  it("counts confirmed and completed bookings", () => {
    expect(occupiesDate({ status: "confirmed" }, NOW)).toBe(true)
    expect(occupiesDate({ status: "completed" }, NOW)).toBe(true)
  })

  it("ignores statuses that freed the date", () => {
    expect(occupiesDate({ status: "declined" }, NOW)).toBe(false)
    expect(occupiesDate({ status: "cancelled" }, NOW)).toBe(false)
    expect(occupiesDate({ status: "expired" }, NOW)).toBe(false)
    // legacy pre-payment rows never locked a date and must not start now
    expect(occupiesDate({ status: "pending" }, NOW)).toBe(false)
  })

  it("counts an unexpired hold", () => {
    expect(occupiesDate({ status: "awaiting_payment", hold_expires_at: future }, NOW)).toBe(true)
  })

  // The whole point of a hold: an abandoned checkout must free the date.
  it("ignores an expired hold", () => {
    expect(occupiesDate({ status: "awaiting_payment", hold_expires_at: past }, NOW)).toBe(false)
  })

  it("treats a hold with no expiry as not occupying, rather than forever", () => {
    expect(occupiesDate({ status: "awaiting_payment", hold_expires_at: null }, NOW)).toBe(false)
    expect(occupiesDate({ status: "awaiting_payment" }, NOW)).toBe(false)
  })

  it("ignores an unparseable expiry instead of locking the date", () => {
    expect(occupiesDate({ status: "awaiting_payment", hold_expires_at: "nonsense" }, NOW)).toBe(false)
  })
})
