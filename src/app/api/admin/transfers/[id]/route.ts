import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

interface Params {
  params: Promise<{ id: string }>
}

// Manual driver assignment + status overrides — this is the entire
// "dispatch" workflow for the MVP (no live GPS/accept-decline yet, per
// scope decision: admin assigns drivers by hand).
export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const allowed = ["driver_id", "status", "notes"] as const
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  // Assigning a driver to a still-unconfirmed booking also bumps it to
  // 'assigned' so it shows up correctly on the driver's dashboard.
  if ("driver_id" in update && update.driver_id && !("status" in update)) {
    update.status = "assigned"
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
