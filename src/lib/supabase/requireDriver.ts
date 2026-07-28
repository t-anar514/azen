import "server-only"
import { NextResponse } from "next/server"
import { createClient } from "./server"
import type { DriverRow } from "./types"

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

/**
 * Stricter guard for the schedule routes: returns the caller's own `drivers`
 * row, and only if the application was approved.
 *
 * Unlike `requireDriver` above this does *not* let an admin through. Every one
 * of these routes writes rows keyed on the caller's own id, so an admin passing
 * the role check would only get as far as RLS refusing the write — a 500 where
 * a 403 belongs. Admins edit a driver's setup through /api/admin/drivers.
 */
export async function requireApprovedDriver() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) } as const
  }

  const { data: driver } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<DriverRow>()

  if (!driver) {
    return { error: NextResponse.json({ error: "Not a driver" }, { status: 403 }) } as const
  }
  if (driver.verification_status !== "approved") {
    return {
      error: NextResponse.json({ error: "Application not approved" }, { status: 403 }),
    } as const
  }

  return { supabase, user, driver } as const
}
