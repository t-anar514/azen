"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { Button } from "@/components/ui/button"
import type { DriverVerificationStatus } from "@/lib/supabase/types"

interface DriverRowActionsProps {
  id: string
  status: DriverVerificationStatus
  isAvailable: boolean
}

export function DriverRowActions({ id, status, isAvailable }: DriverRowActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)

  async function setStatus(verification_status: DriverVerificationStatus) {
    setBusy(true)
    await fetch(`/api/admin/drivers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verification_status }),
    })
    setBusy(false)
    router.refresh()
  }

  async function toggleAvailable() {
    setBusy(true)
    await fetch(`/api/admin/drivers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !isAvailable }),
    })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "pending" && (
        <>
          <Button size="sm" disabled={busy} onClick={() => setStatus("approved")}>
            Approve
          </Button>
          <Button size="sm" variant="destructive" disabled={busy} onClick={() => setStatus("rejected")}>
            Reject
          </Button>
        </>
      )}
      {status === "approved" && (
        <>
          <Button size="sm" variant="outline" disabled={busy} onClick={toggleAvailable}>
            {isAvailable ? "Mark unavailable" : "Mark available"}
          </Button>
          <Button size="sm" variant="destructive" disabled={busy} onClick={() => setStatus("rejected")}>
            Revoke
          </Button>
        </>
      )}
      {status === "rejected" && (
        <Button size="sm" disabled={busy} onClick={() => setStatus("approved")}>
          Approve
        </Button>
      )}
    </div>
  )
}
