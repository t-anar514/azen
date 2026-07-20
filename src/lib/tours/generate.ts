import type {
  GuideRow,
  PlaceRow,
  TourItineraryStop,
  TourPace,
  TourPrefs,
} from "@/lib/supabase/types"

// Interest id → how it matches a place. Kept deliberately simple: v1 ranks by
// category + tag overlap. A SELECT with a human in the loop beats a bad
// recommender (master plan §6.2).
export const INTERESTS: { id: string; label: string; categories: PlaceRow["category"][]; tags: string[] }[] = [
  { id: "culture", label: "Соёл, түүх", categories: ["things_to_do"], tags: ["temple", "shrine", "museum", "art"] },
  { id: "food", label: "Хоол, амт", categories: ["places_to_eat"], tags: ["ramen", "seafood", "market", "snacks"] },
  { id: "nightlife", label: "Шөнийн амьдрал", categories: ["nightlife"], tags: ["bars", "neon", "late-night"] },
  { id: "nature", label: "Байгаль", categories: ["things_to_do", "day_trip"], tags: ["nature", "hike", "riverside"] },
  { id: "shopping", label: "Шопинг", categories: ["shopping", "things_to_do"], tags: ["vintage", "market", "gift"] },
  { id: "hidden", label: "Нуугдмал газрууд", categories: [], tags: [] },
]

const PACE_PLAN: Record<TourPace, { stops: number; durationMin: number }> = {
  relaxed: { stops: 3, durationMin: 120 },
  balanced: { stops: 4, durationMin: 90 },
  packed: { stops: 6, durationMin: 75 },
}

function scorePlace(place: PlaceRow, prefs: TourPrefs): number {
  let score = 0
  const chosen = INTERESTS.filter((i) => prefs.interests.includes(i.id))

  for (const interest of chosen) {
    if (interest.categories.includes(place.category)) score += 3
    const overlap = place.tags.filter((t) => interest.tags.includes(t)).length
    score += overlap * 2
  }

  if (prefs.interests.includes("hidden") && place.is_hidden_gem) score += 4

  // budget fit: penalise places well outside the requested band
  const bandTarget = prefs.budget_band === "budget" ? 1 : prefs.budget_band === "mid" ? 2 : 3
  if (place.price_band != null) score -= Math.abs(place.price_band - bandTarget)

  // gentle tiebreaker so curated order still matters
  score -= place.order_index * 0.01
  return score
}

/**
 * Builds a numbered day plan from a city's published places. Deterministic —
 * the same prefs always produce the same draft, so an admin reviewing a
 * request sees what the traveller saw.
 */
export function generateItinerary(places: PlaceRow[], prefs: TourPrefs): TourItineraryStop[] {
  const plan = PACE_PLAN[prefs.pace] ?? PACE_PLAN.balanced

  const ranked = places
    .map((place) => ({ place, score: scorePlace(place, prefs) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  // keep the day varied: at most 2 stops from any one category
  const perCategory: Record<string, number> = {}
  const chosen: PlaceRow[] = []
  for (const { place } of ranked) {
    if (chosen.length >= plan.stops) break
    const used = perCategory[place.category] ?? 0
    if (used >= 2) continue
    perCategory[place.category] = used + 1
    chosen.push(place)
  }

  // if interests were too narrow to fill the day, top up with anything left
  if (chosen.length < plan.stops) {
    for (const place of places) {
      if (chosen.length >= plan.stops) break
      if (!chosen.some((c) => c.id === place.id)) chosen.push(place)
    }
  }

  return chosen.map((place, index) => ({
    order: index + 1,
    place_id: place.id,
    title: place.name,
    note: place.short_desc ?? place.neighborhood ?? "",
    duration_min: plan.durationMin,
  }))
}

/**
 * v1 guide matching: same city, then rating. Returns the top candidates so a
 * human picks the final match.
 */
export function matchGuides(guides: GuideRow[], cityName: string | null, limit = 3): GuideRow[] {
  const active = guides.filter((g) => g.is_active)
  const inCity = cityName
    ? active.filter((g) => (g.location ?? "").toLowerCase() === cityName.toLowerCase())
    : []
  const pool = inCity.length > 0 ? inCity : active
  return [...pool].sort((a, b) => b.rating - a.rating).slice(0, limit)
}
