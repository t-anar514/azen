import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const { data, error } = await supabase
    .from("phrase_collections")
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
  if (!body?.id || !body?.title) {
    return NextResponse.json({ error: "id and title are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("phrase_collections")
    .insert({
      id: body.id,
      title: body.title,
      description: body.description ?? null,
      cover_image: body.cover_image ?? null,
      phrases: body.phrases ?? [],
      order_index: body.order_index ?? 0,
      published: body.published ?? false,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
