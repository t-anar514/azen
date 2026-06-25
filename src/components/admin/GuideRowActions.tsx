"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import * as React from "react"
import { Button } from "@/components/ui/button"

interface GuideRowActionsProps {
  id: string
  isActive: boolean
}

export function GuideRowActions({ id, isActive }: GuideRowActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)

  async function toggleActive() {
    setBusy(true)
    await fetch(`/api/admin/guides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    })
    setBusy(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("Delete this guide listing? This can't be undone.")) return
    setBusy(true)
    await fetch(`/api/admin/guides/${id}`, { method: "DELETE" })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/guides/${id}/edit`}>Edit</Link>
      </Button>
      <Button variant="outline" size="sm" disabled={busy} onClick={toggleActive}>
        {isActive ? "Deactivate" : "Activate"}
      </Button>
      <Button variant="destructive" size="sm" disabled={busy} onClick={handleDelete}>
        Delete
      </Button>
    </div>
  )
}
