import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })

  const { guideId, rating, body, bookingId } = await req.json().catch(() => ({}))
  const r = Number(rating)
  if (!guideId || !(r >= 1 && r <= 5))
    return NextResponse.json({ error: "invalid" }, { status: 400 })

  const { error } = await supabase.from("guide_reviews").upsert(
    { guide_id: guideId, reviewer_id: user.id, rating: r,
      body: body ?? null, booking_id: bookingId ?? null },
    { onConflict: "guide_id,reviewer_id" })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
