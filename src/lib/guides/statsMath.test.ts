import { describe, it, expect } from "vitest"
import { weekDeltaPct, sumCompleted, earningsByMonth } from "./statsMath"

describe("weekDeltaPct", () => {
  it("computes percent growth vs last week", () => {
    expect(weekDeltaPct(118, 100)).toBe(18)
  })
  it("returns 0 when last week was 0 and this week is 0", () => {
    expect(weekDeltaPct(0, 0)).toBe(0)
  })
  it("returns 100 when growing from zero", () => {
    expect(weekDeltaPct(50, 0)).toBe(100)
  })
})

describe("sumCompleted", () => {
  it("sums only completed amounts", () => {
    expect(sumCompleted([
      { amount: 10500, status: "completed" },
      { amount: 9000,  status: "confirmed" },
      { amount: 3000,  status: "completed" },
    ])).toBe(13500)
  })
})

describe("earningsByMonth", () => {
  it("buckets completed bookings by YYYY-MM", () => {
    const rows = [
      { amount: 100, status: "completed", trip_date: "2026-07-03" },
      { amount: 200, status: "completed", trip_date: "2026-07-30" },
      { amount: 50,  status: "completed", trip_date: "2026-06-10" },
      { amount: 999, status: "declined",  trip_date: "2026-07-10" },
    ]
    expect(earningsByMonth(rows)).toEqual([
      { month: "2026-06", total: 50 },
      { month: "2026-07", total: 300 },
    ])
  })
})
