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

/** Route guard for /studio: signed-out → login; signed-in non-guide → apply. */
export async function requireGuide() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?redirectTo=/studio")
  const { data: guide } = await supabase
    .from("guides").select("*").eq("profile_id", user.id).single<GuideRow>()
  if (!guide) redirect("/guides/apply")
  return { user, guide }
}
