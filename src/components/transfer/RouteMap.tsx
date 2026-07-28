"use client"

import { useEffect } from "react"
import Map, { Marker, Source, Layer, NavigationControl, useMap } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { Plane, MapPin } from "lucide-react"
import type { LatLng } from "@/lib/transfers/route"

const OPEN_FREE_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty"
const DEFAULT_CENTER = { lat: 36.2048, lng: 138.2529 } // Japan
const ROUTE_LAYER_ID = "transfer-route-line"

type Point = (LatLng & { label?: string }) | null

interface RouteMapProps {
  from: Point
  to: Point
  routeGeometry: { type: "LineString"; coordinates: [number, number][] } | null
  onDestinationDragEnd?: (lat: number, lng: number) => void
  // Tailwind height classes for the map container. Defaults to the tall form
  // map; the /transfer summary sidebar passes a shorter one.
  heightClass?: string
}

// Keeps the viewport framed on whatever we currently have — both pins if a
// destination is resolved, otherwise just the airport.
function FitBounds({ from, to }: { from: Point; to: Point }) {
  const { current: map } = useMap()

  useEffect(() => {
    if (!map) return
    const pts = [from, to].filter(Boolean) as LatLng[]
    if (pts.length === 0) return

    if (pts.length === 1) {
      map.easeTo({ center: [pts[0].lng, pts[0].lat], zoom: 10, duration: 800 })
      return
    }

    const lats = pts.map((p) => p.lat)
    const lngs = pts.map((p) => p.lng)
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 64, duration: 900, maxZoom: 13 }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, from?.lat, from?.lng, to?.lat, to?.lng])

  return null
}

// Ant-march animation on the saffron route line — a small on-brand nod to the
// RouteLine motif so the map doesn't read like a bolted-on Google embed.
function RouteDashAnimator({ active }: { active: boolean }) {
  const { current: map } = useMap()

  useEffect(() => {
    if (!map || !active) return
    const dashSeq: number[][] = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5],
    ]
    let step = 0
    let last = 0
    let raf = 0

    const animate = (t: number) => {
      if (t - last > 55) {
        try {
          const m = map.getMap()
          if (m.getLayer(ROUTE_LAYER_ID)) {
            m.setPaintProperty(ROUTE_LAYER_ID, "line-dasharray", dashSeq[step % dashSeq.length])
          }
        } catch {
          // layer not ready yet / map torn down — ignore
        }
        step++
        last = t
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [map, active])

  return null
}

// Nudges MapLibre to recompute its size once the container has settled — the
// same guard the planner map uses, needed when the map mounts inside a card
// whose width isn't final on first paint.
function ResizeOnMount() {
  const { current: map } = useMap()
  useEffect(() => {
    if (!map) return
    const timer = setTimeout(() => map.resize(), 120)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

export function RouteMap({
  from,
  to,
  routeGeometry,
  onDestinationDragEnd,
  heightClass = "h-[320px] md:h-[380px]",
}: RouteMapProps) {
  return (
    <div className={`${heightClass} w-full overflow-hidden rounded-xl border border-border`}>
      <Map
        initialViewState={{
          latitude: from?.lat ?? DEFAULT_CENTER.lat,
          longitude: from?.lng ?? DEFAULT_CENTER.lng,
          zoom: from ? 9 : 5,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={OPEN_FREE_MAP_STYLE}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {routeGeometry && (
          <Source
            id="transfer-route"
            type="geojson"
            data={{ type: "Feature", geometry: routeGeometry, properties: {} }}
          >
            {/* translucent casing under the animated line */}
            <Layer
              id="transfer-route-casing"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": "#DE8C2E", "line-width": 7, "line-opacity": 0.22 }}
            />
            <Layer
              id={ROUTE_LAYER_ID}
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": "#DE8C2E", "line-width": 3, "line-dasharray": [0, 4, 3] }}
            />
          </Source>
        )}

        {from && (
          <Marker latitude={from.lat} longitude={from.lng} anchor="bottom">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-sky-700 shadow-lg">
                <Plane className="h-4 w-4 text-white" />
              </div>
            </div>
          </Marker>
        )}

        {to && (
          <Marker
            latitude={to.lat}
            longitude={to.lng}
            anchor="bottom"
            draggable
            onDragEnd={(e) => onDestinationDragEnd?.(e.lngLat.lat, e.lngLat.lng)}
          >
            <div className="flex cursor-grab flex-col items-center active:cursor-grabbing">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-saffron shadow-lg">
                <MapPin className="h-4 w-4 text-white" />
              </div>
            </div>
          </Marker>
        )}

        <FitBounds from={from} to={to} />
        <RouteDashAnimator active={!!routeGeometry} />
        <ResizeOnMount />
      </Map>
    </div>
  )
}
