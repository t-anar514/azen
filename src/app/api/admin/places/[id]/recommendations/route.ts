import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const { data, error } = await supabase
    .from("place_recommendations")
    .select("*, guides(id, name, image)")
    .eq("place_id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body?.guide_id || !body?.quote) {
    return NextResponse.json({ error: "guide_id and quote are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("place_recommendations")
    .upsert(
      { place_id: id, guide_id: body.guide_id, quote: body.quote },
      { onConflict: "place_id,guide_id" }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function DELETE(request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard
  const { id } = await params

  const recId = new URL(request.url).searchParams.get("rec")
  if (!recId) return NextResponse.json({ error: "rec query param required" }, { status: 400 })

  const { error } = await supabase
    .from("place_recommendations")
    .delete()
    .eq("id", recId)
    .eq("place_id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
