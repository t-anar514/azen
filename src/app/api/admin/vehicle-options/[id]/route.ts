import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

interface Params {
  params: Promise<{ id: string }>
}

// Text columns pass through as-is; numeric columns must be finite numbers.
const STRING_FIELDS = ["name", "description", "currency"] as const
const NUMBER_FIELDS = ["capacity", "price", "base_fare", "price_per_km", "order_index"] as const

// body: partial vehicle_options row. Used by the admin rate-card editor at
// /admin/transfer-pricing to tune each tier's base fare + per-km rate (which
// feed src/lib/transfers/pricing.ts's distance formula), flat price, capacity,
// name and active flag. RLS also gates writes to admins at the DB level.
export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const update: Record<string, unknown> = {}

  for (const key of STRING_FIELDS) {
    if (key in body && body[key] != null) update[key] = String(body[key])
  }

  for (const key of NUMBER_FIELDS) {
    if (key in body) {
      const value = Number(body[key])
      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json({ error: `${key} must be a non-negative number` }, { status: 400 })
      }
      update[key] = value
    }
  }

  if ("is_active" in body) update.is_active = body.is_active === true

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("vehicle_options")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
