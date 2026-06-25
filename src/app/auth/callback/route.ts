import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Handles the redirect Supabase sends after an email confirmation or
// magic-link click. Exchanges the one-time `code` for a real session cookie,
// then sends the user on to wherever they were headed (default: /account).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/account"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
