"use client"

import * as React from "react"
import Map, { Source, Layer, NavigationControl, type MapRef } from "react-map-gl/maplibre"
import type { MapLayerMouseEvent } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import type { PlaceRow } from "@/lib/supabase/types"

const OPEN_FREE_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty"

// Category → pin colour (matches the pastel pill hues, saturated for map contrast)
const CATEGORY_COLOR_EXPR = [
  "match",
  ["get", "category"],
  "things_to_do", "#2D7DD2",
  "places_to_eat", "#DE8C2E",
  "nightlife", "#5F58AD",
  "shopping", "#2E8B6F",
  "day_trip", "#2E8B6F",
  "#1A4E8A",
] as unknown as string

interface PlaceMapProps {
  places: PlaceRow[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  className?: string
}

export function PlaceMap({ places, selectedId, onSelect, className }: PlaceMapProps) {
  const mapRef = React.useRef<MapRef>(null)

  const located = places.filter((p) => p.lat != null && p.lng != null)

  const geojson = React.useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: located.map((p) => ({
        type: "Feature" as const,
        properties: { id: p.id, category: p.category, selected: p.id === selectedId },
        geometry: { type: "Point" as const, coordinates: [p.lng!, p.lat!] },
      })),
    }),
    [located, selectedId]
  )

  const center = React.useMemo(() => {
    if (located.length === 0) return { latitude: 35.68, longitude: 139.75 }
    return {
      latitude: located.reduce((s, p) => s + p.lat!, 0) / located.length,
      longitude: located.reduce((s, p) => s + p.lng!, 0) / located.length,
    }
  }, [located])

  function handleClick(e: MapLayerMouseEvent) {
    const feature = e.features?.[0]
    if (!feature) {
      onSelect(null)
      return
    }
    if (feature.properties?.cluster) {
      // native clustering: zoom one step into the cluster
      const clusterId = feature.properties.cluster_id
      const source = mapRef.current?.getSource("places") as any
      source?.getClusterExpansionZoom(clusterId).then((zoom: number) => {
        mapRef.current?.easeTo({
          center: (feature.geometry as any).coordinates,
          zoom,
          duration: 400,
        })
      })
      return
    }
    onSelect(feature.properties?.id ?? null)
  }

  if (located.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-card bg-muted text-sm text-muted-foreground ${className ?? ""}`}>
        Байршлын мэдээлэл алга
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-card ${className ?? ""}`}>
      <Map
        ref={mapRef}
        initialViewState={{ ...center, zoom: 11.5 }}
        mapStyle={OPEN_FREE_MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={["clusters", "unclustered-point"]}
        onClick={handleClick}
      >
        <NavigationControl position="top-right" />
        <Source
          id="places"
          type="geojson"
          data={geojson}
          cluster
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer
            id="clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": "#1A4E8A",
              "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 30, 28],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            }}
          />
          <Layer
            id="cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": ["get", "point_count_abbreviated"],
              "text-size": 12,
            }}
            paint={{ "text-color": "#ffffff" }}
          />
          <Layer
            id="unclustered-point"
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": CATEGORY_COLOR_EXPR,
              "circle-radius": ["case", ["get", "selected"], 11, 8],
              "circle-stroke-width": ["case", ["get", "selected"], 3, 2],
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>
      </Map>
    </div>
  )
}
