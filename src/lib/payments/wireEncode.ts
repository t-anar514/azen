/**
 * Request encoding for Wire's REST API.
 *
 * **JSON.** Every curl example in Wire's docs uses `-d key=value`, which reads
 * as `application/x-www-form-urlencoded` — and that is what this module used to
 * send. The live API rejects it:
 *
 *     POST /v1/payment_intents   (application/x-www-form-urlencoded)
 *     → 400 {"error":{"type":"invalid_request_error","code":"invalid_json",
 *            "message":"request body is not valid JSON"}}
 *
 * The same request with a JSON body and `Content-Type: application/json`
 * returns 200. Verified against api.wire.mn on 2026-07-25, which also settles
 * the `allowed_operators` question the form encoder had to guess at: it is a
 * plain JSON array, no `key[]` convention involved.
 *
 * Kept as its own module, with tests, so the body format stays one small change
 * away if Wire's API shifts again.
 */

export type BodyValue = string | number | boolean | string[] | undefined | null

export function encodeBody(params: Record<string, BodyValue>): string {
  const body: Record<string, Exclude<BodyValue, undefined | null>> = {}
  for (const [key, value] of Object.entries(params)) {
    // Omit rather than sending an explicit null the API may treat as "clear
    // this field", or the literal string "undefined".
    if (value === undefined || value === null) continue
    body[key] = value
  }
  return JSON.stringify(body)
}
