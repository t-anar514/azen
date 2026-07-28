import { NextResponse } from "next/server"

import { requireApprovedDriver } from "@/lib/supabase/requireDriver"

/**
 * `POST /api/driver/schedule/open` — the "4 долоо хоног нээх" button.
 *
 * All this does is call `open_driver_shifts` (0025). The expansion belongs in
 * the database rather than here because it is the difference between one
 * statement and 84 round-trips, and because the RPC's ON CONFLICT DO NOTHING is
 * what makes a double-tap harmless — a client-side loop would have to
 * re-implement that, less reliably.
 */
export async function POST(request: Request) {
  const guard = await requireApprovedDriver()
  if ("error" in guard) return guard.error
  const { supabase, driver } = guard

  const body = await request.json().catch(() => ({}))
  const weeks = body?.weeks == null ? 4 : Number(body.weeks)
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 12) {
    return NextResponse.json({ error: "weeks must be 1–12" }, { status: 400 })
  }

  const { count: templateCount } = await supabase
    .from("driver_shift_templates")
    .select("weekday", { count: "exact", head: true })
    .eq("driver_id", driver.id)

  // Opening an empty template writes nothing and silently reports success,
  // which reads to the driver as "I opened my schedule" — the exact false
  // belief this whole feature exists to prevent.
  if (!templateCount) {
    return NextResponse.json(
      { error: "Эхлээд долоо хоногийн загвараа тохируулна уу." },
      { status: 409 }
    )
  }

  const { data, error } = await supabase.rpc("open_driver_shifts", { p_weeks: weeks })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ openUntil: data as string | null })
}
