import "server-only"
import { NextResponse } from "next/server"
import { createClient } from "./server"

// Shared guard for /api/driver/* Route Handlers. Mirrors requireAdmin.ts —
// RLS already blocks unauthorized writes at the database level, this just
// returns a clean 401/403 instead of a confusing empty/failed query.
// Admins are allowed through too, so they can debug a driver's view if needed.
export async function requireDriver() {
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

  if (profile?.role !== "driver" && profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Drivers only" }, { status: 403 }) } as const
  }

  return { supabase, user } as const
}
