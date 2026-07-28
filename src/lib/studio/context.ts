import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { DriverRow, GuideRow } from "@/lib/supabase/types"

/**
 * /studio serves two professions now.
 *
 * The design brief for the driver studio is "хөтчийн студитэй ижил бүтэц, ижил
 * навигаци" — same shell, different contents — so rather than standing up a
 * parallel /driver-studio route tree with its own layout, sidebar, tab bar and
 * auth guard to drift out of sync, the existing (studio) layout resolves which
 * kind of professional is signed in and swaps only the nav.
 *
 * Guide wins when someone is both, which is possible in principle and happens
 * in practice for staff test accounts: they had a studio before this existed
 * and it should not move under them.
 */
export type StudioContext =
  | { kind: "guide"; guide: GuideRow; driver: null }
  | { kind: "driver"; driver: DriverRow; guide: null }

const loadStudioContext = cache(async (): Promise<{
  userId: string | null
  context: StudioContext | null
  /** True when a signed-in user has a driver row that is not approved yet. */
  driverPending: boolean
}> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { userId: null, context: null, driverPending: false }

  const [{ data: guide }, { data: driver }] = await Promise.all([
    supabase.from("guides").select("*").eq("profile_id", user.id).maybeSingle<GuideRow>(),
    supabase.from("drivers").select("*").eq("id", user.id).maybeSingle<DriverRow>(),
  ])

  if (guide) return { userId: user.id, context: { kind: "guide", guide, driver: null }, driverPending: false }
  if (driver?.verification_status === "approved") {
    return { userId: user.id, context: { kind: "driver", driver, guide: null }, driverPending: false }
  }
  return { userId: user.id, context: null, driverPending: Boolean(driver) }
})

export async function getStudioContext(): Promise<StudioContext | null> {
  return (await loadStudioContext()).context
}

/**
 * Where to send someone who reached a guide-only studio page without being a
 * guide.
 *
 * Every one of those pages used to hardcode `/guides/apply`, which was correct
 * when the studio had one kind of occupant. Now it can catch a signed-in driver
 * and tell them to apply to be a guide — a dead end that reads as "you are in
 * the wrong product". A driver gets sent to the part of the studio that is
 * theirs instead.
 */
export async function guideFallbackPath(): Promise<string> {
  const { context } = await loadStudioContext()
  return context?.kind === "driver" ? "/studio/schedule" : "/guides/apply"
}

/**
 * Route guard for the shared /studio shell.
 *
 * Each redirect target answers a different question the visitor actually has.
 * A pending driver goes back to /driver/apply because that page tells them
 * where their application stands; sending them to the guide funnel — which is
 * what the previous guide-only guard did to every non-guide — would tell them
 * to start over as something they never applied to be.
 */
export async function requireStudio(): Promise<StudioContext> {
  const { userId, context, driverPending } = await loadStudioContext()
  if (!userId) redirect("/login?redirectTo=/studio")
  if (context) return context
  if (driverPending) redirect("/driver/apply")

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()
  redirect(profile?.role === "admin" ? "/admin" : "/guides/apply")
}
