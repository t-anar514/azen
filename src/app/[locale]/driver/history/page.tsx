import { redirect } from "next/navigation"

/**
 * `/driver/history` — kept only as a redirect.
 *
 * Superseded on both halves of what it did: /studio/jobs lists finished work
 * under "Өмнөх", and /studio/earnings carries the fare totals it used to sum
 * inline (with the same caveat that payouts are not wired up yet).
 */
export default function DriverHistoryRedirect() {
  redirect("/studio/jobs")
}
