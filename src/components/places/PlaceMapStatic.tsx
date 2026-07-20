"use client"

import Map, { Marker, NavigationControl } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

const OPEN_FREE_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty"

// Single-marker map for the place detail page.
export function PlaceMapStatic({ lat, lng, className }: { lat: number; lng: number; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-card ${className ?? ""}`}>
      <Map
        initialViewState={{ latitude: lat, longitude: lng, zoom: 14.5 }}
        mapStyle={OPEN_FREE_MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />
        <Marker latitude={lat} longitude={lng}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary shadow-lg">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        </Marker>
      </Map>
    </div>
  )
}
