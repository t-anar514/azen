import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateItinerary, matchGuides } from "@/lib/tours/generate"
import type { GuideRow, PlaceRow, TourPrefs } from "@/lib/supabase/types"

// Generates the draft day plan without persisting anything — the wizard shows
// this card before the traveller commits, so abandoned wizards leave no rows.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.city_id || !body?.prefs) {
    return NextResponse.json({ error: "city_id and prefs are required" }, { status: 400 })
  }

  const prefs = body.prefs as TourPrefs
  const supabase = await createClient()

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

  const placeRows = (places ?? []) as PlaceRow[]
  const itinerary = generateItinerary(placeRows, prefs)
  const matches = matchGuides((guides ?? []) as GuideRow[], city.name)
  const imageByPlace = Object.fromEntries(placeRows.map((p) => [p.id, p.cover_image]))

  return NextResponse.json({
    data: {
      itinerary: itinerary.map((stop) => ({
        ...stop,
        cover_image: imageByPlace[stop.place_id] ?? null,
      })),
      matched_guide: matches[0]
        ? {
            id: matches[0].id,
            name: matches[0].name,
            image: matches[0].image,
            rating: matches[0].rating,
            location: matches[0].location,
          }
        : null,
    },
  })
}
