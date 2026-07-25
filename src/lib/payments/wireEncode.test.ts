import { describe, expect, it } from "vitest"

import { encodeForm } from "./wireEncode"

describe("encodeForm", () => {
  it("encodes scalars", () => {
    expect(encodeForm({ amount: 50_000, currency: "MNT" })).toBe(
      "amount=50000&currency=MNT"
    )
  })

  it("repeats bracketed keys for arrays", () => {
    expect(encodeForm({ allowed_operators: ["sandbox", "golomt"] })).toBe(
      "allowed_operators%5B%5D=sandbox&allowed_operators%5B%5D=golomt"
    )
  })

  // Sending the string "undefined" as a description would put it on the
  // buyer's payment record.
  it("omits undefined and null instead of stringifying them", () => {
    expect(encodeForm({ amount: 1, description: undefined, note: null })).toBe(
      "amount=1"
    )
  })

  it("keeps an empty string, which is not the same as absent", () => {
    expect(encodeForm({ description: "" })).toBe("description=")
  })

  it("escapes values that would otherwise break the encoding", () => {
    expect(encodeForm({ description: "Order #1001 & co" })).toBe(
      "description=Order+%231001+%26+co"
    )
  })

  it("encodes an empty array as nothing", () => {
    expect(encodeForm({ allowed_operators: [] })).toBe("")
  })
})
