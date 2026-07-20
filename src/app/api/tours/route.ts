import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateItinerary, matchGuides } from "@/lib/tours/generate"
import type { GuideRow, PlaceRow, TourPrefs } from "@/lib/supabase/types"

const PACES = ["relaxed", "balanced", "packed"]
const BANDS = ["budget", "mid", "premium"]

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.city_id || !body?.prefs) {
    return NextResponse.json({ error: "city_id and prefs are required" }, { status: 400 })
  }

  const prefs = body.prefs as TourPrefs
  if (!PACES.includes(prefs.pace) || !BANDS.includes(prefs.budget_band)) {
    return NextResponse.json({ error: "Invalid pace or budget band" }, { status: 400 })
  }
  if (!Array.isArray(prefs.interests) || prefs.interests.length === 0) {
    return NextResponse.json({ error: "Pick at least one interest" }, { status: 400 })
  }
  if (!body.contact_email?.trim()) {
    return NextResponse.json({ error: "Contact email is required" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: city }, { data: places }, { data: guides }] = await Promise.all([
    supabase.from("cities").select("id, name").eq("id", body.city_id).single(),
    supabase
      .from("places")
      .select("*")
      .eq("city_id", body.city_id)
      .eq("published", true)
      .order("order_index"),
    supabase.from("guides").select("*").eq("is_active", true),
  ])

  if (!city) return NextResponse.json({ error: "Unknown city" }, { status: 400 })

  const itinerary = generateItinerary((places ?? []) as PlaceRow[], prefs)
  const matches = matchGuides((guides ?? []) as GuideRow[], city.name)

  // Server-generated id + plain INSERT: adding .select() would append RETURNING,
  // which re-checks the SELECT policies against the new row. An anonymous
  // request (user_id null) matches none of them, so the insert would fail —
  // the same trap migration 0010 documented for itineraries.
  const requestId = crypto.randomUUID()

  const { error } = await supabase.from("tour_requests").insert({
    id: requestId,
    user_id: user?.id ?? null,
    city_id: body.city_id,
    contact_email: body.contact_email.trim(),
    contact_name: body.contact_name?.trim() || null,
    prefs,
    generated_itinerary: itinerary,
    matched_guide_id: matches[0]?.id ?? null,
    status: "requested",
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(
    {
      data: {
        id: requestId,
        itinerary,
        matched_guide: matches[0]
          ? { id: matches[0].id, name: matches[0].name, image: matches[0].image, rating: matches[0].rating }
          : null,
      },
    },
    { status: 201 }
  )
}
