/**
 * Request encoding for Wire's REST API.
 *
 * Every curl example in Wire's docs uses `-d key=value`, which is
 * `application/x-www-form-urlencoded` — not JSON — so that is what is sent.
 *
 * The array convention is the genuinely uncertain part: Wire documents
 * `allowed_operators` as a list but never shows it over raw HTTP, only through
 * the SDKs. `key[]=a&key[]=b` is the convention its API otherwise mirrors.
 * Isolated here, with tests, so a sandbox call proving otherwise is a small
 * change in one place.
 */

export type FormValue = string | number | boolean | string[] | undefined | null

export function encodeForm(params: Record<string, FormValue>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    // Omit rather than sending "undefined"/"null" as literal strings.
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value) search.append(`${key}[]`, item)
    } else {
      search.append(key, String(value))
    }
  }
  return search.toString()
}
