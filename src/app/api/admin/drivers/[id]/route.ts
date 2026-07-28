import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

interface Params {
  params: Promise<{ id: string }>
}

// Approve, reject or reinstate an application. Approving here is what flips the
// applicant's profiles.role to 'driver' — see trg_sync_driver_role in
// 0005_transfers.sql — and what unlocks /studio/schedule for them.
//
// `is_available` is deliberately no longer writable. It was an admin-side
// on/off switch for a driver's whole existence; since 0025 availability is the
// driver's own shift calendar, and letting an admin flip a boolean that nothing
// reads would be a control that silently does nothing.
export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const allowed = ["verification_status", "min_notice_hours", "max_jobs_per_day"] as const
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("drivers")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
