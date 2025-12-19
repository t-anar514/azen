"use client"

import Map, { Marker, NavigationControl } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { Experience } from "@/data/experiences"

const OPEN_FREE_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty"

export function ExperienceMap({ meetingPoint }: { meetingPoint: Experience['meetingPoint'] }) {
  const center = { latitude: meetingPoint.lat, longitude: meetingPoint.lng }

  return (
    <div className="h-full w-full grayscale-[0.5] contrast-[1.1]">
        <Map
          initialViewState={{
            ...center,
            zoom: 15
          }}
          mapStyle={OPEN_FREE_MAP_STYLE}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />
          <Marker {...center}>
             <div className="w-8 h-8 rounded-full bg-[#227c70] border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
             </div>
          </Marker>
        </Map>
    </div>
  )
}
