import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Service-role Supabase client — bypasses Row Level Security entirely.
//
// SERVER-ONLY. Never import this from a Client Component or anything that
// could end up in a browser bundle; the `server-only` import above will throw
// a build error if that ever happens by mistake.
//
// Use this only for operations the anon/session-bound client genuinely can't
// do, e.g. listing/inviting Supabase Auth users for the admin "Users" panel
// (auth.users isn't queryable through PostgREST). Everyday admin CRUD on
// cities/hacks/guides/phrase_collections should go through `lib/supabase/server.ts`
// instead, so it stays governed by the `is_admin()` RLS policies.
export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co"
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key"

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
