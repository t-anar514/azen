"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import * as React from "react"
import { Button } from "@/components/ui/button"

interface HackRowActionsProps {
  id: string
  published: boolean
}

export function HackRowActions({ id, published }: HackRowActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)

  async function togglePublished() {
    setBusy(true)
    await fetch(`/api/admin/blog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    })
    setBusy(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${id}"? This can't be undone.`)) return
    setBusy(true)
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/blog/${id}/edit`}>Edit</Link>
      </Button>
      <Button variant="outline" size="sm" disabled={busy} onClick={togglePublished}>
        {published ? "Unpublish" : "Publish"}
      </Button>
      <Button variant="destructive" size="sm" disabled={busy} onClick={handleDelete}>
        Delete
      </Button>
    </div>
  )
}
