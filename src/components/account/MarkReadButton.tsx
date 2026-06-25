"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export function MarkReadButton({ messageId }: { messageId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setBusy(true)
    const supabase = createClient()
    await supabase.from("messages").update({ status: "read" }).eq("id", messageId)
    setBusy(false)
    router.refresh()
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={busy}>
      {busy ? "…" : "Уншсан гэж тэмдэглэх"}
    </Button>
  )
}
