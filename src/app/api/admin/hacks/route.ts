import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const { data, error } = await supabase
    .from("hacks")
    .select("*")
    .order("order_index", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase, user } = guard

  const body = await request.json().catch(() => null)
  if (!body?.id || !body?.title || !body?.category) {
    return NextResponse.json({ error: "id, title and category are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("hacks")
    .insert({
      id: body.id,
      title: body.title,
      category: body.category,
      summary: body.summary ?? null,
      steps: body.steps ?? [],
      pro_tip: body.pro_tip ?? null,
      cover_image: body.cover_image ?? null,
      related_ids: body.related_ids ?? [],
      trap_alternative: body.trap_alternative ?? null,
      published: body.published ?? false,
      order_index: body.order_index ?? 0,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
