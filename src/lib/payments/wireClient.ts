import "server-only"

import { encodeBody, type BodyValue } from "./wireEncode"
import { isTestKey, selectOperators } from "./operators"

/**
 * Wire REST client.
 *
 * Deliberately no SDK. Checkout sessions are REST-only in Wire's own docs, the
 * one piece of real cryptography (signature verification) is a documented
 * ten-line HMAC that lives in `wireSignature.ts`, and this keeps an unaudited
 * third-party package away from a code path that moves money.
 *
 * `server-only` is load-bearing: this module reads the secret key, and the
 * import makes pulling it into a client bundle a build error rather than a leak.
 */

const API_BASE = process.env.WIRE_API_BASE ?? "https://api.wire.mn/v1"

export class WireError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly requestId?: string
  ) {
    super(message)
    this.name = "WireError"
  }
}

function apiKey(): string {
  const key = process.env.WIRE_API_KEY ?? process.env.WIRE_SECRET_KEY
  if (!key) throw new Error("WIRE_API_KEY or WIRE_SECRET_KEY is not set")
  return key
}

/** Test keys route to the built-in `sandbox` operator and never move money. */
export function isTestMode(): boolean {
  return isTestKey(process.env.WIRE_API_KEY ?? process.env.WIRE_SECRET_KEY)
}

/**
 * Which operators a buyer may pay with, or `undefined` to leave the choice to
 * Wire. See `selectOperators` — it carries the reasoning and the tests.
 */
export function resolveOperators(): string[] | undefined {
  return selectOperators(
    process.env.WIRE_API_KEY ?? process.env.WIRE_SECRET_KEY,
    process.env.WIRE_OPERATORS
  )
}

async function wirePost<T>(
  path: string,
  params: Record<string, BodyValue>,
  idempotencyKey: string
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        // JSON, not form encoding — the API rejects the latter outright with
        // 400 invalid_json. See wireEncode.
        "Content-Type": "application/json",
        // Required on every mutating POST. Replaying a key returns the original
        // result instead of creating a second charge.
        "Idempotency-Key": idempotencyKey,
      },
      body: encodeBody(params),
      cache: "no-store",
    })
  } catch (cause) {
    // A network failure is not "payment declined" — the caller must be able to
    // tell them apart, because one is safe to retry and the other is not.
    throw new WireError(`could not reach Wire: ${String(cause)}`, 0, "network_error")
  }

  const text = await res.text()
  let body: Record<string, unknown> | null = null
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : null
  } catch {
    // Non-JSON error pages (gateway timeouts, WAF blocks) are surfaced as-is
    // below rather than crashing the parse.
  }

  if (!res.ok) {
    const err = (body?.error ?? body) as Record<string, unknown> | null
    throw new WireError(
      (err?.message as string) ?? text.slice(0, 200) ?? `Wire ${res.status}`,
      res.status,
      err?.code as string | undefined,
      (err?.request_id as string | undefined) ??
        res.headers.get("request-id") ??
        undefined
    )
  }

  return body as T
}

export interface WirePaymentIntent {
  id: string
  status: string
}

export async function createPaymentIntent(args: {
  /** Integer MNT, already through `toWireAmount`. */
  amount: number
  description?: string
  allowedOperators?: string[]
  idempotencyKey: string
}): Promise<WirePaymentIntent> {
  return wirePost<WirePaymentIntent>(
    "/payment_intents",
    {
      amount: args.amount,
      currency: "MNT",
      description: args.description,
      allowed_operators: args.allowedOperators ?? resolveOperators(),
    },
    args.idempotencyKey
  )
}

export interface WireCheckoutSession {
  id: string
  url: string
  payment_intent: string
}

export async function createCheckoutSession(args: {
  paymentIntentId: string
  /** Must be absolute HTTPS — Wire rejects anything else. Omit on http origins
   *  (local dev), where Wire shows its own completion page instead. */
  successUrl?: string
  cancelUrl?: string
  idempotencyKey: string
}): Promise<WireCheckoutSession> {
  return wirePost<WireCheckoutSession>(
    "/checkout/sessions",
    {
      payment_intent: args.paymentIntentId,
      success_url: httpsOnly(args.successUrl),
      cancel_url: httpsOnly(args.cancelUrl),
    },
    args.idempotencyKey
  )
}

function httpsOnly(url: string | undefined): string | undefined {
  return url?.startsWith("https://") ? url : undefined
}
