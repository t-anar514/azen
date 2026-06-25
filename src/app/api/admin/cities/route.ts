import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const { data, error } = await supabase
    .from("cities")
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
  if (!body?.id || !body?.name) {
    return NextResponse.json({ error: "id and name are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("cities")
    .insert({
      id: body.id,
      name: body.name,
      hero_image: body.hero_image ?? null,
      teaser: body.teaser ?? null,
      introduction: body.introduction ?? null,
      history: body.history ?? { text: "", imageUrl: "" },
      culture: body.culture ?? { text: "", imageUrl: "" },
      expenses: body.expenses ?? { text: "", imageUrl: "", tiers: [] },
      climate: body.climate ?? { text: "", imageUrl: "", seasons: [] },
      districts: body.districts ?? { mapUrl: "", list: [] },
      getting_around: body.getting_around ?? null,
      vibe: body.vibe ?? { text: "", imageUrl: "" },
      published: body.published ?? false,
      order_index: body.order_index ?? 0,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
