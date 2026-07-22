import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { GuideRow } from "@/lib/supabase/types"

export async function getCurrentGuide() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: guide } = await supabase
    .from("guides").select("*").eq("profile_id", user.id).single<GuideRow>()
  if (!guide) return null
  return { user, guide }
}

/**
 * Route guard for /studio: signed-out → login; signed-in non-guide → apply.
 * Admins without a personal guide row have no studio data to show — send
 * them to their own dashboard instead of the guide-applicant funnel.
 */
export async function requireGuide() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?redirectTo=/studio")
  const { data: guide } = await supabase
    .from("guides").select("*").eq("profile_id", user.id).single<GuideRow>()
  if (!guide) {
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single()
    redirect(profile?.role === "admin" ? "/admin" : "/guides/apply")
  }
  return { user, guide }
}
