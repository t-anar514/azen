"use client"

import * as React from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

// Small client-side auth indicator for the Navbar: shows "Log in" when signed
// out, "Account" when signed in. Kept separate from the rest of Navbar so it
// can subscribe to auth state changes independently.
export function NavAuthLink({ className }: { className?: string }) {
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  if (isLoggedIn === null) {
    return null
  }

  return (
    <Link href={isLoggedIn ? "/account" : "/login"} className={className}>
      {isLoggedIn ? "Account" : "Log in"}
    </Link>
  )
}
