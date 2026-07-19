import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Handles the redirect Supabase sends after OAuth, magic-link, or password
// recovery. Exchanges the one-time `code` for a session cookie, then sends
// the user on to `next` (default: /account). Password reset uses
// next=/reset-password.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const rawNext = searchParams.get("next") ?? "/account"
  const next = rawNext.startsWith("/") ? rawNext : "/account"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
