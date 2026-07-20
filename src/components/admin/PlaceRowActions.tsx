"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function PlaceRowActions({ id, published }: { id: string; published: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)

  async function togglePublished() {
    setBusy(true)
    await fetch(`/api/admin/places/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    })
    setBusy(false)
    router.refresh()
  }

  async function remove() {
    if (!confirm("Delete this place? This also removes its guide recommendations.")) return
    setBusy(true)
    await fetch(`/api/admin/places/${id}`, { method: "DELETE" })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/places/${id}/edit`}>Edit</Link>
      </Button>
      <Button variant="outline" size="sm" disabled={busy} onClick={togglePublished}>
        {published ? "Unpublish" : "Publish"}
      </Button>
      <Button variant="ghost" size="sm" disabled={busy} onClick={remove} className="text-destructive">
        Delete
      </Button>
    </div>
  )
}
