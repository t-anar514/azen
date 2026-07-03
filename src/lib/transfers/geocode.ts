// Photon (Komoot) geocoding wrapper — free, no API key, CORS-enabled, so it
// runs straight from the browser. Centralizes the inline Photon logic that
// was first used in src/components/planner/TimelineItem.tsx, now that the
// /transfer map needs it too.

export interface GeocodeResult {
  label: string
  lat: number
  lng: number
  city?: string
  country?: string
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] }
  properties?: {
    name?: string
    city?: string
    state?: string
    country?: string
  }
}

export async function geocode(
  query: string,
  opts?: { limit?: number; signal?: AbortSignal }
): Promise<GeocodeResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${opts?.limit ?? 5}`,
      { signal: opts?.signal }
    )
    if (!res.ok) return []
    const data = (await res.json()) as { features?: PhotonFeature[] }

    return (data.features ?? [])
      .filter((f) => Array.isArray(f.geometry?.coordinates))
      .map((f) => {
        const [lng, lat] = f.geometry!.coordinates as [number, number]
        const p = f.properties ?? {}
        const label = [p.name, p.city, p.state, p.country].filter(Boolean).join(", ")
        return { label: label || p.name || q, lat, lng, city: p.city, country: p.country }
      })
  } catch {
    // Network error or aborted request — callers treat an empty list as
    // "couldn't resolve", which degrades to showing just the airport pin.
    return []
  }
}

/**
 * Turns a curated zone label into a query Photon can actually resolve.
 * Zone labels are human descriptions of an area ("Tokyo — Shinjuku / Shibuya
 * (central)"), not addresses. We take the most specific-looking token and
 * anchor it to Japan so the map pin lands somewhere sensible — it only needs
 * to be approximate, since the pin is draggable and the price is zone-based,
 * not pin-based.
 *
 *   "Tokyo — Shinjuku / Shibuya (central)" → "Shinjuku, Japan"
 *   "Narita city / airport-area hotels"    → "Narita city, Japan"
 *   "Kyoto (central)"                      → "Kyoto, Japan"
 */
export function zoneLabelToQuery(label: string): string {
  const core = label
    .split("—")
    .pop()! // part after the em dash, or the whole label if there is none
    .split("/")[0] // first named place before a slash
    .replace(/\(.*?\)/g, "") // drop "(central)" etc.
    .trim()
  return `${core}, Japan`
}
