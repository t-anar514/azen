import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  isValidDateKey,
  MAX_BATCH_DATES,
  toDateKey,
} from "@/lib/guides/availability"

/**
 * Block or unblock days for the *session's own* guide. The guide id is never
 * read from the body — RLS would reject a foreign write anyway, but resolving
 * it server-side means the request can't even be shaped to try.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })

  const { data: guide } = await supabase
    .from("guides").select("id").eq("profile_id", user.id).single()
  if (!guide) return NextResponse.json({ error: "not a guide" }, { status: 403 })

  const { dates, action } = await req.json().catch(() => ({}))
  if (action !== "block" && action !== "unblock")
    return NextResponse.json({ error: "invalid action" }, { status: 400 })
  if (!Array.isArray(dates) || dates.length === 0)
    return NextResponse.json({ error: "no dates" }, { status: 400 })
  if (dates.length > MAX_BATCH_DATES)
    return NextResponse.json({ error: "too many dates" }, { status: 400 })

  const today = toDateKey(new Date())
  const clean = [...new Set(dates)].filter(
    (d): d is string => isValidDateKey(d) && d >= today
  )
  if (clean.length === 0)
    return NextResponse.json({ error: "no valid dates" }, { status: 400 })

  // A day with a confirmed booking is already closed. Blocking it is redundant
  // state; unblocking it would falsely reopen a day the guide has sold. Refuse
  // both rather than silently dropping the request.
  const { data: confirmed } = await supabase
    .from("guide_bookings")
    .select("trip_date")
    .eq("guide_id", guide.id)
    .eq("status", "confirmed")
    .in("trip_date", clean)

  if (confirmed && confirmed.length > 0) {
    return NextResponse.json(
      {
        error: "confirmed booking",
        dates: confirmed.map((r: { trip_date: string }) => r.trip_date),
      },
      { status: 409 }
    )
  }

  if (action === "block") {
    const { error } = await supabase
      .from("guide_unavailable_dates")
      .upsert(
        clean.map((date) => ({ guide_id: guide.id, date })),
        { onConflict: "guide_id,date", ignoreDuplicates: true }
      )
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else {
    // Idempotent: deleting rows that aren't there is a no-op, so a double-tap
    // or a retried request can't fail.
    const { error } = await supabase
      .from("guide_unavailable_dates")
      .delete()
      .eq("guide_id", guide.id)
      .in("date", clean)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, changed: clean.length })
}
