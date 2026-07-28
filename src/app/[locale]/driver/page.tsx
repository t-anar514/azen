import { redirect } from "next/navigation"

/**
 * `/driver` — kept only as a redirect.
 *
 * This used to be the driver's dashboard. Since the driver studio landed
 * (0025 / design 6b) there would otherwise be two of them: this one and
 * /studio/jobs, which shows the same bookings plus the status-advance control
 * that used to live here. Two driver homes means two places to keep in sync and
 * a coin-flip over which one a driver has bookmarked.
 *
 * The route itself stays rather than being deleted, because it is the URL in
 * every existing bookmark and in any notification already sent.
 */
export default function DriverDashboardRedirect() {
  redirect("/studio/jobs")
}
