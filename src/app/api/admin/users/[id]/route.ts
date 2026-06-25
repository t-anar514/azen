import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

interface Params {
  params: Promise<{ id: string }>
}

const VALID_ROLES = ["user", "guide", "admin"]

// Direct role override for the admin Users panel. Linking a guide profile via
// /api/admin/guides/[id] (profile_id) is the normal "promote to guide" path —
// this endpoint exists for manual corrections (e.g. promoting/demoting admins).
export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase, user } = guard
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body?.role || !VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: "role must be one of user, guide, admin" }, { status: 400 })
  }

  if (id === user.id && body.role !== "admin") {
    return NextResponse.json({ error: "You can't remove your own admin role." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: body.role })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
