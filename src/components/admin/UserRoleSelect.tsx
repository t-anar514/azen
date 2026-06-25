"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

interface UserRoleSelectProps {
  userId: string
  role: string
}

export function UserRoleSelect({ userId, role }: UserRoleSelectProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    setBusy(false)
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json?.error || "Failed to update role.")
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-1">
      <select
        value={role}
        disabled={busy}
        onChange={handleChange}
        className="border-input dark:bg-input/30 h-8 rounded-md border bg-transparent px-2 text-sm shadow-xs outline-none"
      >
        <option value="user">user</option>
        <option value="guide">guide</option>
        <option value="admin">admin</option>
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
