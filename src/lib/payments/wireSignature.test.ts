import { createHmac } from "node:crypto"
import { describe, expect, it } from "vitest"

import { verifyWebhookSignature } from "./wireSignature"

const SECRET = "whsec_test_2f8a91c4"
const BODY = JSON.stringify({ id: "evt_1", type: "payment_intent.succeeded" })
const NOW = 1_717_000_000

function sign(body: string, secret: string, t: number): string {
  const v1 = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex")
  return `t=${t},v1=${v1}`
}

describe("verifyWebhookSignature", () => {
  it("accepts a correctly signed payload", () => {
    const res = verifyWebhookSignature({
      rawBody: BODY,
      header: sign(BODY, SECRET, NOW),
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(true)
  })

  // The whole point: a body altered in transit must not verify, even by one byte.
  it("rejects a tampered body", () => {
    const header = sign(BODY, SECRET, NOW)
    const tampered = JSON.stringify({
      id: "evt_1",
      type: "payment_intent.succeeded",
      amount: 999,
    })
    const res = verifyWebhookSignature({
      rawBody: tampered,
      header,
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(false)
  })

  it("rejects a signature made with a different secret", () => {
    const res = verifyWebhookSignature({
      rawBody: BODY,
      header: sign(BODY, "whsec_attacker", NOW),
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(false)
  })

  // Replay protection — a captured-and-resent delivery goes stale.
  it("rejects a timestamp older than the tolerance", () => {
    const old = NOW - 301
    const res = verifyWebhookSignature({
      rawBody: BODY,
      header: sign(BODY, SECRET, old),
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.reason).toMatch(/tolerance/i)
  })

  it("accepts a timestamp just inside the tolerance", () => {
    const res = verifyWebhookSignature({
      rawBody: BODY,
      header: sign(BODY, SECRET, NOW - 299),
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(true)
  })

  // Clock skew can put a legitimate delivery slightly ahead, but far-future
  // timestamps would otherwise buy an attacker an unlimited replay window.
  it("rejects a timestamp far in the future", () => {
    const res = verifyWebhookSignature({
      rawBody: BODY,
      header: sign(BODY, SECRET, NOW + 3600),
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(false)
  })

  it("rejects a missing header", () => {
    const res = verifyWebhookSignature({
      rawBody: BODY,
      header: null,
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.reason).toMatch(/missing/i)
  })

  it("rejects an empty signing secret rather than verifying against nothing", () => {
    const res = verifyWebhookSignature({
      rawBody: BODY,
      header: sign(BODY, SECRET, NOW),
      secret: "",
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.reason).toMatch(/secret/i)
  })

  it.each([
    ["garbage", "no key=value pairs"],
    ["v1=abc", "no timestamp"],
    ["t=1717000000", "no v1"],
    ["t=notanumber,v1=abc", "non-numeric timestamp"],
    ["", "empty string"],
  ])("rejects a malformed header (%s)", (header) => {
    const res = verifyWebhookSignature({
      rawBody: BODY,
      header,
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(false)
  })

  // timingSafeEqual throws on unequal buffer lengths — a short v1 must be
  // rejected, not crash the webhook route.
  it("rejects a short signature without throwing", () => {
    expect(() =>
      verifyWebhookSignature({
        rawBody: BODY,
        header: `t=${NOW},v1=deadbeef`,
        secret: SECRET,
        nowSeconds: NOW,
      })
    ).not.toThrow()
  })

  it("rejects non-hex characters without throwing", () => {
    const res = verifyWebhookSignature({
      rawBody: BODY,
      header: `t=${NOW},v1=${"z".repeat(64)}`,
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(false)
  })

  // Lets a secret be rotated without dropping in-flight deliveries.
  it("accepts when several v1 values are present and one matches", () => {
    const good = createHmac("sha256", SECRET).update(`${NOW}.${BODY}`).digest("hex")
    const res = verifyWebhookSignature({
      rawBody: BODY,
      header: `t=${NOW},v1=${"a".repeat(64)},v1=${good}`,
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(true)
  })

  it("tolerates whitespace around the header parts", () => {
    const v1 = createHmac("sha256", SECRET).update(`${NOW}.${BODY}`).digest("hex")
    const res = verifyWebhookSignature({
      rawBody: BODY,
      header: ` t = ${NOW} , v1 = ${v1} `,
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(true)
  })

  // An empty body still has a valid signature over "t." — it must not be
  // special-cased into passing.
  it("verifies an empty body correctly", () => {
    const res = verifyWebhookSignature({
      rawBody: "",
      header: sign("", SECRET, NOW),
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(res.ok).toBe(true)

    const wrong = verifyWebhookSignature({
      rawBody: "",
      header: sign("something", SECRET, NOW),
      secret: SECRET,
      nowSeconds: NOW,
    })
    expect(wrong.ok).toBe(false)
  })
})
