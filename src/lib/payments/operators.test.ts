import { describe, it, expect } from "vitest"

import { isTestKey, selectOperators } from "./operators"

const TEST_KEY = "sk_test_abc123"
const LIVE_KEY = "sk_live_abc123"

describe("isTestKey", () => {
  it("is true only for sk_test_ keys", () => {
    expect(isTestKey(TEST_KEY)).toBe(true)
    expect(isTestKey(LIVE_KEY)).toBe(false)
    expect(isTestKey("")).toBe(false)
    expect(isTestKey(undefined)).toBe(false)
  })
})

describe("selectOperators", () => {
  it("pins test-mode checkouts to the sandbox operator", () => {
    expect(selectOperators(TEST_KEY, undefined)).toEqual(["sandbox"])
    // A stray live-operator list must not leak into a sandbox charge.
    expect(selectOperators(TEST_KEY, "qpay,socialpay")).toEqual(["sandbox"])
  })

  it("narrows live checkouts to the configured operators", () => {
    expect(selectOperators(LIVE_KEY, "qpay,socialpay")).toEqual(["qpay", "socialpay"])
    expect(selectOperators(LIVE_KEY, " qpay , socialpay ")).toEqual(["qpay", "socialpay"])
  })

  it("leaves the choice to Wire when live operators are unset", () => {
    // Regression: returning [] here made the checkout route refuse every
    // booking with 503 "no payment operator configured", even though the
    // account had operators activated in the Wire dashboard. Omitting the
    // parameter lets Wire offer whatever is actually enabled.
    expect(selectOperators(LIVE_KEY, undefined)).toBeUndefined()
    expect(selectOperators(LIVE_KEY, "")).toBeUndefined()
    expect(selectOperators(LIVE_KEY, "   ")).toBeUndefined()
    expect(selectOperators(LIVE_KEY, ",,")).toBeUndefined()
  })

  it("never returns an empty list, which would encode as no operators at all", () => {
    for (const configured of [undefined, "", "  ", ",", ",,"]) {
      expect(selectOperators(LIVE_KEY, configured)).not.toEqual([])
    }
  })
})
