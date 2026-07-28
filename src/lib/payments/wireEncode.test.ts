import { describe, expect, it } from "vitest"

import { encodeBody } from "./wireEncode"

const parse = (s: string) => JSON.parse(s) as Record<string, unknown>

describe("encodeBody", () => {
  it("sends JSON, not form encoding", () => {
    // Verified against the live API: a form-urlencoded body is rejected with
    // 400 invalid_json / "request body is not valid JSON". Wire's curl examples
    // use -d key=value, which reads as form encoding but is not what the API
    // accepts.
    expect(parse(encodeBody({ amount: 50_000, currency: "MNT" }))).toEqual({
      amount: 50_000,
      currency: "MNT",
    })
  })

  it("keeps numbers as numbers rather than stringifying them", () => {
    expect(parse(encodeBody({ amount: 387_181 })).amount).toBe(387_181)
  })

  it("encodes arrays as JSON arrays", () => {
    expect(parse(encodeBody({ allowed_operators: ["sandbox", "golomt"] }))).toEqual({
      allowed_operators: ["sandbox", "golomt"],
    })
  })

  // Sending the string "undefined" as a description would put it on the
  // buyer's payment record; sending an explicit null risks the API rejecting
  // or overwriting a field we meant to leave alone.
  it("omits undefined and null instead of sending them", () => {
    expect(parse(encodeBody({ amount: 1, description: undefined, note: null }))).toEqual({
      amount: 1,
    })
  })

  it("keeps an empty string, which is not the same as absent", () => {
    expect(parse(encodeBody({ description: "" }))).toEqual({ description: "" })
  })

  it("keeps an empty array, which is not the same as absent", () => {
    expect(parse(encodeBody({ allowed_operators: [] }))).toEqual({
      allowed_operators: [],
    })
  })

  it("escapes characters that would otherwise break the payload", () => {
    const body = encodeBody({ description: 'Azen · "Anar" \\ 日本 & co' })
    expect(parse(body).description).toBe('Azen · "Anar" \\ 日本 & co')
  })

  it("produces a body the API parses as an object", () => {
    expect(encodeBody({ amount: 1 }).startsWith("{")).toBe(true)
  })
})
