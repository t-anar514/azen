import "server-only"
import { NextResponse } from "next/server"
import { createClient } from "./server"

// Shared guard for every /api/admin/* Route Handler. RLS (`is_admin()` in
// supabase/migrations/0001_init.sql) already blocks unauthorized writes at the
// database level — this is the app-layer check that returns a clean 401/403
// instead of a confusing empty/failed query.
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) } as const
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Admins only" }, { status: 403 }) } as const
  }

  return { supabase, user } as const
}
