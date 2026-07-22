import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })

  const { guideId, tripDate, hours, city, note } = await req.json().catch(() => ({}))
  const h = Number(hours)
  if (!guideId || !tripDate || !h || h <= 0)
    return NextResponse.json({ error: "invalid" }, { status: 400 })

  const { data: guide } = await supabase
    .from("guides").select("price").eq("id", guideId).single()
  if (!guide) return NextResponse.json({ error: "no guide" }, { status: 404 })
  const amount = Number(guide.price ?? 0) * h

  // traveler can read own rows → select-after-insert is safe here
  const { data, error } = await supabase.from("guide_bookings")
    .insert({ guide_id: guideId, traveler_id: user.id, trip_date: tripDate,
              hours: h, city: city ?? null, note: note ?? null, amount })
    .select("id,status").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })

  const { id, status } = await req.json().catch(() => ({}))
  const allowed = ["confirmed", "declined", "completed", "cancelled"]
  if (!id || !allowed.includes(status))
    return NextResponse.json({ error: "invalid" }, { status: 400 })

  // RLS gb_guide_update ensures only the owning guide can update
  const { data, error } = await supabase.from("guide_bookings")
    .update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    .select("id")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data?.length) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
