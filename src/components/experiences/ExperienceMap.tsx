"use client"

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps"
import { Experience } from "@/data/experiences"

const AZEN_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#e6e2c3" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#1c315e" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#1c315e" }]
  }
]

export function ExperienceMap({ meetingPoint }: { meetingPoint: Experience['meetingPoint'] }) {
  const center = { lat: meetingPoint.lat, lng: meetingPoint.lng }

  return (
    <div className="h-full w-full grayscale-[0.5] contrast-[1.1]">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={center}
          defaultZoom={15}
          styles={AZEN_MAP_STYLE}
          disableDefaultUI={true}
          mapId="AZEN_EXPERIENCE_MAP"
        >
          <AdvancedMarker position={center}>
            <Pin 
              background={'#227c70'} 
              borderColor={'#ffffff'} 
              glyphColor={'#ffffff'} 
              scale={1.2}
            />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  )
}
