import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Cookie-free Supabase client bound to the anon key.
 *
 * Use this for public reads that must not opt a route into dynamic rendering.
 * `lib/supabase/server.ts` reads `cookies()`, which makes any caller dynamic —
 * fine for pages, fatal for statically generated metadata routes like
 * `sitemap.ts`, where it throws "Dynamic server usage" at build time.
 *
 * Because it carries no session, every query runs as `anon` and sees exactly
 * what an unauthenticated visitor sees. For a sitemap that is the correct
 * visibility: it cannot accidentally advertise unpublished rows the way a
 * service-role client would.
 */
export function createAnonClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
