import { describe, it, expect } from "vitest"
import { resolveDayState, toDateKey, isValidDateKey } from "./availability"

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
