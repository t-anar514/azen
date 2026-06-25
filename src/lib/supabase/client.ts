"use client"

import { createBrowserClient } from "@supabase/ssr"

// Browser-side Supabase client. Falls back to harmless placeholder values when
// env vars aren't set yet, so the app builds/runs before real keys are added —
// any real auth/data call will simply fail until NEXT_PUBLIC_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.
export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
