import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Wire webhook signature verification.
 *
 * The webhook endpoint is unauthenticated by necessity — Wire's servers call it
 * — so this signature *is* the authentication. Anything that gets past this
 * function is treated as Wire saying a booking was paid for, which is why it
 * lives on its own with no network and no environment access, and is tested
 * directly rather than only through the route.
 *
 * Header format, per Wire's docs:
 *
 *     WirePayment-Signature: t=1717000000,v1=5257a869e7ec...
 *
 * where `v1` is a hex HMAC-SHA256 over `"<t>.<rawbody>"` keyed by the endpoint
 * secret (`whsec_…`).
 */

export const SIGNATURE_HEADER = "WirePayment-Signature"

/** Wire's SDKs default to 300s; matching them keeps behaviour predictable. */
export const DEFAULT_TOLERANCE_SECONDS = 300

export type VerifyResult = { ok: true } | { ok: false; reason: string }

interface VerifyArgs {
  /** The unparsed request body. Parsing first changes the bytes and the HMAC
   *  will no longer match — Wire's docs call this out explicitly. */
  rawBody: string
  header: string | null | undefined
  secret: string
  toleranceSeconds?: number
  /** Injectable clock, so replay-window behaviour can be tested without waiting. */
  nowSeconds?: number
}

export function verifyWebhookSignature({
  rawBody,
  header,
  secret,
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
  nowSeconds,
}: VerifyArgs): VerifyResult {
  if (!header) return { ok: false, reason: "missing signature header" }
  // Guard explicitly: an unset env var would otherwise HMAC against "" and
  // quietly accept anything signed with an empty key.
  if (!secret) return { ok: false, reason: "missing signing secret" }

  let timestamp: string | undefined
  const signatures: string[] = []

  for (const part of header.split(",")) {
    const eq = part.indexOf("=")
    if (eq === -1) continue
    const key = part.slice(0, eq).trim()
    const value = part.slice(eq + 1).trim()
    if (key === "t") timestamp = value
    else if (key === "v1") signatures.push(value)
  }

  if (!timestamp || !/^\d+$/.test(timestamp)) {
    return { ok: false, reason: "malformed or missing timestamp" }
  }
  if (signatures.length === 0) return { ok: false, reason: "no v1 signature present" }

  const now = nowSeconds ?? Math.floor(Date.now() / 1000)
  // Absolute difference, so a far-future timestamp can't buy an unbounded
  // replay window off a skewed or attacker-chosen clock.
  if (Math.abs(now - Number(timestamp)) > toleranceSeconds) {
    return { ok: false, reason: `timestamp outside ${toleranceSeconds}s tolerance` }
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest()

  for (const candidate of signatures) {
    // Buffer.from(…, "hex") truncates at the first invalid pair rather than
    // throwing, and timingSafeEqual throws outright on a length mismatch — so
    // the length check both rejects junk and keeps the route from crashing.
    const buf = Buffer.from(candidate, "hex")
    if (buf.length !== expected.length) continue
    if (timingSafeEqual(buf, expected)) return { ok: true }
  }

  return { ok: false, reason: "signature mismatch" }
}
