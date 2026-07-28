"use client"

import { useEffect, useState, useMemo } from "react"
import Map, { Marker, Popup, Source, Layer, NavigationControl, FullscreenControl, useMap } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { ItemType } from "./Timeline"
import { Building2, MapPin } from "lucide-react"
import { nearestCityName } from "@/lib/planner/format"

// Mock Geocoding Data — known labels from the default itinerary/templates.
const LOCATION_COORDS: Record<string, { lat: number, lng: number }> = {
  "Narita Airport": { lat: 35.7720, lng: 140.3929 },
  "Asakusa View Hotel": { lat: 35.7145, lng: 139.7925 },
  "Asakusa Temple": { lat: 35.7148, lng: 139.7967 },
  "Senso-ji": { lat: 35.7148, lng: 139.7967 },
  "Shibuya": { lat: 35.6580, lng: 139.7016 },
  "Shinjuku Gyoen": { lat: 35.6852, lng: 139.7101 },
  "Tokyo Tower": { lat: 35.6586, lng: 139.7454 },
  "Harajuku": { lat: 35.6702, lng: 139.7027 },
  "Akihabara": { lat: 35.6984, lng: 139.7711 },
}

const DEFAULT_CENTER = { lat: 35.6895, lng: 139.6917 } // Tokyo Center
const OPEN_FREE_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty"
const NAVY = "#0C1826"
const SAFFRON = "#DE8C2E"

interface InteractiveMapProps {
  items: ItemType[]
  hoveredId: string | null
  onMapClick?: (lat: number, lng: number, locationName?: string) => void
  isPicking?: boolean
}

type LocatedItem = ItemType & { coords: { lat: number, lng: number }, index: number }

// Numbered pin matching the timeline's numbering (design doc Screen 03):
// navy circle with the item's №, flipping saffron when its card is hovered.
const ActivityMarker = ({ item, isHovered, onSelect }: {
  item: LocatedItem
  isHovered: boolean
  onSelect: (item: LocatedItem) => void
}) => (
  <Marker
    latitude={item.coords.lat}
    longitude={item.coords.lng}
    anchor="center"
    onClick={(e) => {
      e.originalEvent.stopPropagation()
      onSelect(item)
    }}
  >
    <div
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs font-black text-white shadow-lg transition-all duration-200 ${isHovered ? "scale-125" : "scale-100"}`}
      style={{ background: isHovered ? SAFFRON : NAVY }}
    >
      {item.index}
    </div>
  </Marker>
)

function MapUpdater({ items }: { items: LocatedItem[] }) {
    const { current: map } = useMap();

    useEffect(() => {
        if (!map || items.length === 0) return;

        const lats = items.map(i => i.coords.lat);
        const lngs = items.map(i => i.coords.lng);

        map.fitBounds(
            [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
            { padding: 100, duration: 1000, maxZoom: 14 }
        );
    }, [map, items]);

    return null;
}

export function InteractiveMap({ items, hoveredId, onMapClick, isPicking }: InteractiveMapProps) {
  const [selectedItem, setSelectedItem] = useState<LocatedItem | null>(null)

  // Only items whose position is actually known get a pin — an unplaced
  // activity shouldn't fake a marker at the Tokyo fallback center. The index
  // is the item's overall № so pins match the timeline numbering.
  const locatedItems = useMemo<LocatedItem[]>(() => {
    const result: LocatedItem[] = []
    items.forEach((item, i) => {
      const coords =
        item.lat != null && item.lng != null
          ? { lat: item.lat, lng: item.lng }
          : LOCATION_COORDS[item.location] ?? null
      if (coords) result.push({ ...item, coords, index: i + 1 })
    })
    return result
  }, [items])

  // Saffron itinerary line through the pins in visit order.
  const routeGeoJson = useMemo(() => {
    if (locatedItems.length < 2) return null
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: locatedItems.map((i) => [i.coords.lng, i.coords.lat]),
      },
    }
  }, [locatedItems])

  // Floating "Токио · 2 өдөр" chip: nearest city to the itinerary's centroid
  // plus the number of distinct planned days.
  const cityChip = useMemo(() => {
    if (locatedItems.length === 0) return null
    const avgLat = locatedItems.reduce((s, i) => s + i.coords.lat, 0) / locatedItems.length
    const avgLng = locatedItems.reduce((s, i) => s + i.coords.lng, 0) / locatedItems.length
    const city = nearestCityName(avgLat, avgLng)
    if (!city) return null
    const dayCount = new Set(items.map((i) => i.date)).size
    return { city, dayCount }
  }, [locatedItems, items])

  // Get map instance for resizing
  const { current: mapInstance } = useMap()

  useEffect(() => {
    if (mapInstance) {
      // Force a resize after a short delay to ensure container dimensions are settled
      const timer = setTimeout(() => {
        mapInstance.resize()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [mapInstance])

  return (
    <div className="h-full w-full relative">
        <Map
          initialViewState={{
            latitude: DEFAULT_CENTER.lat,
            longitude: DEFAULT_CENTER.lng,
            zoom: 12
          }}
          style={{ width: '100%', height: '100%', cursor: isPicking ? 'crosshair' : 'grab' }}
          mapStyle={OPEN_FREE_MAP_STYLE}
          onClick={(e) => {
            if (isPicking && onMapClick) {
              onMapClick(e.lngLat.lat, e.lngLat.lng)
            }
          }}
        >
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />

          {routeGeoJson && (
            <Source id="itinerary-route" type="geojson" data={routeGeoJson}>
              {/* translucent casing under the line, same treatment as /transfer */}
              <Layer
                id="itinerary-route-casing"
                type="line"
                layout={{ "line-cap": "round", "line-join": "round" }}
                paint={{ "line-color": SAFFRON, "line-width": 7, "line-opacity": 0.22 }}
              />
              <Layer
                id="itinerary-route-line"
                type="line"
                layout={{ "line-cap": "round", "line-join": "round" }}
                paint={{ "line-color": SAFFRON, "line-width": 3 }}
              />
            </Source>
          )}

          {locatedItems.map((item) => (
            <ActivityMarker
                key={item.id}
                item={item}
                isHovered={hoveredId === item.id}
                onSelect={setSelectedItem}
            />
          ))}

          {selectedItem && (
            <Popup
                latitude={selectedItem.coords.lat}
                longitude={selectedItem.coords.lng}
                anchor="top"
                onClose={() => setSelectedItem(null)}
                closeButton={true}
                closeOnClick={false}
                className="z-50"
            >
                <div className="p-2 min-w-[150px]">
                    <h4 className="font-bold text-foreground mb-1">{selectedItem.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {selectedItem.location}
                    </p>
                    <div className="flex justify-between items-center text-[10px] font-mono border-t pt-2">
                        <span>{new Date(selectedItem.date).toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
                        <span className="text-accent font-bold">¥{selectedItem.cost.toLocaleString()}</span>
                    </div>
                </div>
            </Popup>
          )}

          {/* Map Logic Helper */}
          <MapUpdater items={locatedItems} />
        </Map>

        {cityChip && (
          <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-pill bg-white/95 px-3 py-1.5 text-sm font-semibold text-foreground shadow-lg border border-border/60">
            <Building2 className="h-4 w-4 text-primary" />
            {cityChip.city} · {cityChip.dayCount} өдөр
          </div>
        )}
    </div>
  )
}
