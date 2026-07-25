import { describe, expect, it } from "vitest"

import {
  MNT_UNITS_PER_TOGROG,
  jpyToTogrog,
  toWireAmount,
  isUsableRate,
} from "./money"

describe("MNT_UNITS_PER_TOGROG", () => {
  // Wire's own docs disagree: the quickstart says minor units (50000 = 500.00 ₮)
  // while the payment-links page says "whole tögrög (MNT has no minor unit)".
  // Getting it wrong charges 100x. This asserts the choice is deliberate — if
  // a sandbox charge proves otherwise, this test is the thing that changes.
  it("is 1 — amounts are whole tögrög", () => {
    expect(MNT_UNITS_PER_TOGROG).toBe(1)
  })
})

describe("jpyToTogrog", () => {
  it("converts at the given rate", () => {
    expect(jpyToTogrog(10_000, 22.3)).toBe(223_000)
  })

  it("rounds to a whole tögrög — MNT has no subunit to carry a fraction", () => {
    expect(jpyToTogrog(1, 22.4)).toBe(22)
    expect(jpyToTogrog(1, 22.5)).toBe(23)
    expect(jpyToTogrog(3, 22.3)).toBe(67) // 66.9
  })

  it("handles a realistic booking without floating-point drift", () => {
    // 3h at ¥8,500/h
    expect(jpyToTogrog(25_500, 22.3)).toBe(568_650)
  })

  it("rejects a non-positive amount", () => {
    expect(() => jpyToTogrog(0, 22.3)).toThrow(/amount/i)
    expect(() => jpyToTogrog(-1, 22.3)).toThrow(/amount/i)
  })

  it("rejects a non-finite amount or rate", () => {
    expect(() => jpyToTogrog(NaN, 22.3)).toThrow()
    expect(() => jpyToTogrog(Infinity, 22.3)).toThrow()
    expect(() => jpyToTogrog(10_000, NaN)).toThrow()
  })

  // A zero or missing rate would silently charge 0 ₮ for a real booking.
  it("rejects a non-positive rate rather than charging nothing", () => {
    expect(() => jpyToTogrog(10_000, 0)).toThrow(/rate/i)
    expect(() => jpyToTogrog(10_000, -22.3)).toThrow(/rate/i)
  })
})

describe("toWireAmount", () => {
  it("passes whole tögrög through", () => {
    expect(toWireAmount(223_000)).toBe(223_000)
  })

  it("rejects a fractional tögrög — Wire takes integers only", () => {
    expect(() => toWireAmount(223_000.5)).toThrow(/integer/i)
  })

  it("rejects a non-positive amount", () => {
    expect(() => toWireAmount(0)).toThrow()
    expect(() => toWireAmount(-5)).toThrow()
  })

  it("stays inside the safe integer range", () => {
    expect(() => toWireAmount(Number.MAX_SAFE_INTEGER + 1)).toThrow()
  })
})

describe("isUsableRate", () => {
  it("accepts a plausible JPY→MNT rate", () => {
    expect(isUsableRate(22.3)).toBe(true)
  })

  it("rejects missing, zero, or non-finite rates", () => {
    expect(isUsableRate(undefined)).toBe(false)
    expect(isUsableRate(null)).toBe(false)
    expect(isUsableRate(0)).toBe(false)
    expect(isUsableRate(NaN)).toBe(false)
    expect(isUsableRate(-1)).toBe(false)
  })
})
