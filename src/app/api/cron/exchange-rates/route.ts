import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchLatestJpyRates } from "@/lib/currency/fetchRates"

// Vercel Cron hits this once a day (see vercel.json). Protected by
// CRON_SECRET so randoms can't trigger it (and hammer the upstream API on
// our behalf).
export async function GET(request: Request) {
  const auth = request.headers.get("authorization")
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const rates = await fetchLatestJpyRates()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("exchange_rates")
      .upsert({ id: 1, base_currency: "JPY", rates, fetched_at: new Date().toISOString() })
    if (error) throw error
    return NextResponse.json({ ok: true, rates })
  } catch (err) {
    // Deliberately don't touch the cached row on failure — yesterday's real
    // rate is a better fallback than no rate or a crash.
    console.error("exchange-rates cron failed:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
