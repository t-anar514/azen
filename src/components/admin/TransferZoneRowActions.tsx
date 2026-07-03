"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import * as React from "react"
import { Button } from "@/components/ui/button"

interface TransferZoneRowActionsProps {
  id: string
  isActive: boolean
}

export function TransferZoneRowActions({ id, isActive }: TransferZoneRowActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)

  async function toggleActive() {
    setBusy(true)
    await fetch(`/api/admin/transfer-zones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    })
    setBusy(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("Delete this destination zone and its curated prices? This can't be undone.")) return
    setBusy(true)
    await fetch(`/api/admin/transfer-zones/${id}`, { method: "DELETE" })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/transfer-pricing/${id}/edit`}>Edit</Link>
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
