/**
 * Which Wire operators a checkout may use.
 *
 * Split out of `wireClient` purely so it can be tested: that module imports
 * `server-only`, which by design cannot be loaded from a test runner, and this
 * is the one piece of its logic that decides whether a booking can be paid for
 * at all.
 */

/** Test keys route to the built-in `sandbox` operator and never move money. */
export function isTestKey(apiKey: string | undefined): boolean {
  return (apiKey ?? "").startsWith("sk_test_")
}

/**
 * Returns the operator allow-list, or `undefined` to send no `allowed_operators`
 * at all and let Wire offer whatever the account has activated.
 *
 * The distinction matters: `encodeForm` drops both `undefined` and `[]`, so an
 * empty list and an absent one look identical on the wire, but an empty list
 * previously tripped a guard in the checkout route that returned 503 before the
 * booking was ever attempted. Operator activation happens in Wire's dashboard
 * and is not necessarily mirrored into `WIRE_OPERATORS`, so "unset" must mean
 * "don't narrow", not "none available".
 */
export function selectOperators(
  apiKey: string | undefined,
  configured: string | undefined
): string[] | undefined {
  if (isTestKey(apiKey)) return ["sandbox"]
  const list = (configured ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  return list.length > 0 ? list : undefined
}
