import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Server-side Supabase client for use in Server Components, Server Actions, and
// Route Handlers. Reads/writes the auth session via Next.js cookies.
//
// NOTE: Server Components can't write cookies — if this is called from one, the
// `setAll` call below throws and is intentionally swallowed. Session refresh is
// instead handled in `middleware.ts`, which runs before every request.
export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component — safe to ignore, middleware refreshes sessions.
        }
      },
    },
  })
}
