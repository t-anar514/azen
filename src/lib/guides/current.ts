import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { GuideRow } from "@/lib/supabase/types"

/**
 * Cached per-request: one auth.getUser() + one guides-row lookup, shared by
 * every getCurrentGuide()/requireGuide() call within the same render. Without
 * this, a single /studio request pays for the same auth+select twice — once
 * from the (studio) layout's requireGuide() and again from the dashboard
 * page's getCurrentGuide(). React's cache() dedupes by call-site arguments
 * for the lifetime of one request, so both call sites get the same result.
 */
const loadGuideContext = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, guide: null }
  const { data: guide } = await supabase
    .from("guides").select("*").eq("profile_id", user.id).single<GuideRow>()
  return { user, guide: guide ?? null }
})

export async function getCurrentGuide() {
  const { user, guide } = await loadGuideContext()
  if (!user || !guide) return null
  return { user, guide }
}

/**
 * Route guard for /studio: signed-out → login; signed-in non-guide → apply.
 * Admins without a personal guide row have no studio data to show — send
 * them to their own dashboard instead of the guide-applicant funnel.
 */
export async function requireGuide() {
  const { user, guide } = await loadGuideContext()
  if (!user) redirect("/login?redirectTo=/studio")
  if (!guide) {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single()
    redirect(profile?.role === "admin" ? "/admin" : "/guides/apply")
  }
  return { user, guide }
}
