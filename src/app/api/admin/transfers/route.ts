import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"

export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("pickup_datetime", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
