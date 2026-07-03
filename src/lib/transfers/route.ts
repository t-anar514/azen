// Driving-directions wrapper. Returns distance, duration and route geometry
// for drawing a line on the /transfer map.
//
// Uses the public OSRM demo server (free, no key, CORS-enabled, GeoJSON
// geometry drops straight into a MapLibre line layer). NOTE: the demo
// instance has no SLA and its usage policy discourages production traffic —
// fine for building/demoing, but before /transfer takes real load this should
// point at a self-hosted OSRM or a paid directions API. The swap is contained
// to this file as long as the getDrivingRoute() signature is preserved.

export interface LatLng {
  lat: number
  lng: number
}

export interface RouteResult {
  distanceKm: number
  durationMin: number
  geometry: { type: "LineString"; coordinates: [number, number][] }
}

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving"

export async function getDrivingRoute(
  from: LatLng,
  to: LatLng,
  opts?: { signal?: AbortSignal }
): Promise<RouteResult | null> {
  try {
    const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    const res = await fetch(url, { signal: opts?.signal })
    if (!res.ok) return null

    const data = (await res.json()) as {
      routes?: {
        distance?: number
        duration?: number
        geometry?: { type: "LineString"; coordinates: [number, number][] }
      }[]
    }

    const route = data.routes?.[0]
    if (!route?.geometry || route.distance == null || route.duration == null) return null

    return {
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.round(route.duration / 60),
      geometry: route.geometry,
    }
  } catch {
    return null
  }
}
