"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Map, { Marker, Popup, NavigationControl, FullscreenControl, useMap } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { ItemType, ActivityType } from "./Timeline"
import { 
  Plane, 
  MapPin, 
  Coffee, 
  Utensils, 
  ShoppingBag, 
  Train,
  Camera,
  Sparkles,
  Landmark,
  Wine,
  Activity
} from "lucide-react"

// Mock Geocoding Data
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

interface InteractiveMapProps {
  items: ItemType[]
  hoveredId: string | null
  onMapClick?: (lat: number, lng: number, locationName?: string) => void
  isPicking?: boolean
}

const ActivityMarker = ({ item, isHovered, onSelect }: { item: ItemType & { coords: { lat: number, lng: number } }, isHovered: boolean, onSelect: (item: any) => void }) => {
    const getIcon = (type: ActivityType) => {
        const props = { className: "w-4 h-4 text-white" }
        switch (type) {
            case "flight": return <Plane {...props} />
            case "food": return <Utensils {...props} />
            case "hotel": return <Coffee {...props} />
            case "shopping": return <ShoppingBag {...props} />
            case "transport": return <Train {...props} />
            case "sightseeing": return <Camera {...props} />
            case "nature": return <Sparkles {...props} />
            case "culture": return <Landmark {...props} />
            case "nightlife": return <Wine {...props} />
            case "activity": return <Activity {...props} />
            default: return <MapPin {...props} />
        }
    }

    return (
        <Marker
            latitude={item.coords.lat}
            longitude={item.coords.lng}
            anchor="bottom"
            onClick={(e) => {
                e.originalEvent.stopPropagation()
                onSelect(item)
            }}
        >
            <div className="relative group">
                {isHovered && (
                    <div className="absolute -inset-2 bg-[#88a47c]/40 rounded-full animate-pulse blur-sm" />
                )}
                <div className={`
                    p-2 rounded-full shadow-lg transition-all duration-300 cursor-pointer relative z-10
                    ${isHovered ? 'bg-[#88a47c] scale-125 ring-4 ring-[#88a47c]/30' : 'bg-[#227c70] scale-100'}
                    border-2 border-white
                `}>
                    {getIcon(item.type)}
                </div>
            </div>
        </Marker>
    )
}

function MapUpdater({ items }: { items: (ItemType & { coords: { lat: number, lng: number } })[] }) {
    const { current: map } = useMap();

    useEffect(() => {
        if (!map || items.length === 0) return;

        const lats = items.map(i => i.coords.lat);
        const lngs = items.map(i => i.coords.lng);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        map.fitBounds(
            [[minLng, minLat], [maxLng, maxLat]],
            { padding: 100, duration: 1000 }
        );
    }, [map, items]);

    return null;
}

export function InteractiveMap({ items, hoveredId, onMapClick, isPicking }: InteractiveMapProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Enrich items with coordinates
  const enrichedItems = useMemo(() => {
    return items.map(item => {
      // 1. Use coordinates if they exist on the item
      if (item.lat && item.lng) {
        return { ...item, coords: { lat: item.lat, lng: item.lng } }
      }
      // 2. Use mock coordinates if available
      if (LOCATION_COORDS[item.location]) {
        return { ...item, coords: LOCATION_COORDS[item.location] }
      }
      // 3. Default to center
      return { ...item, coords: DEFAULT_CENTER }
    })
  }, [items])

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
          
          {enrichedItems.map((item) => (
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
                    <h4 className="font-bold text-[#1c315e] mb-1">{selectedItem.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {selectedItem.location}
                    </p>
                    <div className="flex justify-between items-center text-[10px] font-mono border-t pt-2">
                        <span>{new Date(selectedItem.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span className="text-accent font-bold">¥{selectedItem.cost.toLocaleString()}</span>
                    </div>
                </div>
            </Popup>
          )}

          {/* Map Logic Helper */}
          <MapUpdater items={enrichedItems} />
        </Map>

        <div className="absolute top-4 left-4 p-3 bg-white/90 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl z-10 border border-primary/10">
            OpenFreeMap <span className="text-accent ml-2">Liberty Style</span>
        </div>
    </div>
  )
}
