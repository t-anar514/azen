import { describe, it, expect } from "vitest"
import { nextAutumnStart, toIsoDate, materializeTemplateDates } from "./templateDates"

describe("nextAutumnStart", () => {
  it("returns 15 October of the same year when today is before it", () => {
    expect(toIsoDate(nextAutumnStart(new Date(2026, 7, 12)))).toBe("2026-10-15")
  })

  it("rolls to the next year on 15 October itself", () => {
    expect(toIsoDate(nextAutumnStart(new Date(2026, 9, 15)))).toBe("2027-10-15")
  })

  it("rolls to the next year after 15 October", () => {
    expect(toIsoDate(nextAutumnStart(new Date(2026, 11, 1)))).toBe("2027-10-15")
  })
})

describe("toIsoDate", () => {
  it("formats in local time, not UTC", () => {
    // 1 Jan 2026 at 08:00 local. A UTC-based formatter would report
    // 2025-12-31 for anyone east of Greenwich.
    expect(toIsoDate(new Date(2026, 0, 1, 8, 0))).toBe("2026-01-01")
  })
})

describe("materializeTemplateDates", () => {
  it("converts dayOffset into dates counted from the start", () => {
    const result = materializeTemplateDates(
      [
        { id: "a", dayOffset: 0 },
        { id: "b", dayOffset: 3 },
      ],
      new Date(2026, 9, 15)
    )
    expect(result).toEqual([
      { id: "a", date: "2026-10-15" },
      { id: "b", date: "2026-10-18" },
    ])
  })

  it("drops the dayOffset field from the output", () => {
    const [first] = materializeTemplateDates([{ id: "a", dayOffset: 0 }], new Date(2026, 9, 15))
    expect(first).not.toHaveProperty("dayOffset")
  })

  it("crosses a month boundary correctly", () => {
    const [item] = materializeTemplateDates([{ id: "a", dayOffset: 20 }], new Date(2026, 9, 15))
    expect(item.date).toBe("2026-11-04")
  })
})
