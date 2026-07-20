import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.full_name?.trim() || !body?.email?.trim()) {
    return NextResponse.json({ error: "Нэр болон имэйл шаардлагатай." }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from("guide_applications").insert({
    user_id: user?.id ?? null,
    full_name: body.full_name.trim(),
    email: body.email.trim(),
    phone: body.phone?.trim() || null,
    city_id: body.city_id || null,
    languages: Array.isArray(body.languages) ? body.languages : [],
    bio: body.bio?.trim() || null,
    motivation: body.motivation?.trim() || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
