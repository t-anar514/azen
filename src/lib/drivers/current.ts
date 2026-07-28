import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { DriverRow } from "@/lib/supabase/types"

/**
 * Cached per-request, for the same reason `@/lib/guides/current` is: the
 * (studio) layout and the page inside it both need to know who is looking, and
 * without this each render pays for two auth.getUser() round-trips plus two
 * driver lookups.
 */
const loadDriverContext = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { user: null, driver: null }

  const { data: driver } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<DriverRow>()

  return { user, driver: driver ?? null }
})

/**
 * The signed-in driver, or null. Unlike the guide equivalent this also filters
 * on approval: a pending applicant has a `drivers` row but no schedule to keep,
 * and letting them open shifts would sell rides nobody has vetted.
 */
export async function getCurrentDriver() {
  const { user, driver } = await loadDriverContext()
  if (!user || !driver || driver.verification_status !== "approved") return null
  return { user, driver }
}

/**
 * Route guard for the driver half of /studio.
 *
 * The three redirects are three different situations, and collapsing them would
 * strand somebody: no session → sign in; no application → the apply funnel; an
 * application still under review → their existing status page, not a schedule
 * editor they are not yet allowed to use.
 */
export async function requireDriver() {
  const { user, driver } = await loadDriverContext()
  if (!user) redirect("/login?redirectTo=/studio/schedule")
  if (!driver) redirect("/driver/apply")
  if (driver.verification_status !== "approved") redirect("/driver/apply")
  return { user, driver }
}
