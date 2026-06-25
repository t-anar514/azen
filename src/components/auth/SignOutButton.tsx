"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    setLoading(false)
    router.push("/")
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleSignOut} disabled={loading} className={className}>
      {loading ? "Signing out…" : "Sign out"}
    </Button>
  )
}
