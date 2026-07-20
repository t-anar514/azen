import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

interface Params {
  params: Promise<{ id: string }>
}

const STATUSES = ["draft", "requested", "matched", "confirmed", "declined"]

export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ("status" in body) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: `status must be one of: ${STATUSES.join(", ")}` }, { status: 400 })
    }
    update.status = body.status
  }
  if ("matched_guide_id" in body) update.matched_guide_id = body.matched_guide_id || null

  const { data, error } = await supabase
    .from("tour_requests")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
