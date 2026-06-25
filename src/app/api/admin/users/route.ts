import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"
import { createAdminClient } from "@/lib/supabase/admin"

// Lists every signed-up user merged with their profile role. auth.users isn't
// exposed through PostgREST, so emails/last-sign-in come from the Auth Admin
// API (service-role client) while role/full_name come from `profiles`.
export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const [{ data: profiles, error: profilesError }, authUsers] = await Promise.all([
    supabase.from("profiles").select("id, full_name, avatar_url, role, created_at"),
    createAdminClient().auth.admin.listUsers(),
  ])

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }

  const authById = new Map(authUsers.data?.users?.map((u) => [u.id, u]) ?? [])

  const data = (profiles ?? []).map((p) => {
    const authUser = authById.get(p.id)
    return {
      ...p,
      email: authUser?.email ?? null,
      joined_at: authUser?.created_at ?? p.created_at,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      email_confirmed: !!authUser?.email_confirmed_at,
    }
  })

  return NextResponse.json({ data })
}
