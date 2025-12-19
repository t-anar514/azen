"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow, 
  useMap,
  Pin
} from "@vis.gl/react-google-maps"
import { ItemType, ActivityType } from "./Timeline"
import { 
  Plane, 
  MapPin, 
  Coffee, 
  Utensils, 
  ShoppingBag, 
  Train 
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

const AZEN_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#e6e2c3" }] // Land (Cream)
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#1c315e" }] // Text (Deep Blue)
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#1c315e" }] // Water (Deep Blue)
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  // Add more styling as needed for "Silver/Retro" look
]

interface InteractiveMapProps {
  items: ItemType[]
  hoveredId: string | null
}

const ActivityMarker = ({ item, isHovered }: { item: ItemType & { coords: { lat: number, lng: number } }, isHovered: boolean }) => {
    const [open, setOpen] = useState(false)
    
    const getIcon = (type: ActivityType) => {
        const props = { className: "w-4 h-4 text-white" }
        switch (type) {
            case "flight": return <Plane {...props} />
            case "food": return <Utensils {...props} />
            case "hotel": return <Coffee {...props} />
            case "shopping": return <ShoppingBag {...props} />
            case "transport": return <Train {...props} />
            default: return <MapPin {...props} />
        }
    }

    return (
        <>
            <AdvancedMarker
                position={item.coords}
                onClick={() => setOpen(true)}
            >
                <div className={`
                    p-2 rounded-full shadow-lg transition-all duration-300
                    ${isHovered ? 'bg-[#88a47c] scale-125 z-50' : 'bg-[#227c70] scale-100'}
                    border-2 border-white
                `}>
                    {getIcon(item.type)}
                </div>
            </AdvancedMarker>
            
            {open && (
                <InfoWindow 
                    position={item.coords} 
                    onCloseClick={() => setOpen(false)}
                >
                    <div className="p-2 min-w-[150px]">
                        <h4 className="font-bold text-[#1c315e] mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {item.location}
                        </p>
                        <div className="flex justify-between items-center text-[10px] font-mono border-t pt-2">
                            <span>{item.time}</span>
                            <span className="text-accent font-bold">¥{item.cost.toLocaleString()}</span>
                        </div>
                    </div>
                </InfoWindow>
            )}
        </>
    )
}

function MapUpdater({ items }: { items: (ItemType & { coords: { lat: number, lng: number } })[] }) {
    const map = useMap();

    useEffect(() => {
        if (!map || items.length === 0) return;

        const bounds = new google.maps.LatLngBounds();
        items.forEach(item => bounds.extend(item.coords));
        
        map.fitBounds(bounds, {
            top: 100, 
            bottom: 100, 
            left: 100, 
            right: 100
        });
    }, [map, items]);

    return null;
}

export function InteractiveMap({ items, hoveredId }: InteractiveMapProps) {
  // Enrich items with coordinates
  const enrichedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      coords: LOCATION_COORDS[item.location] || DEFAULT_CENTER
    }))
  }, [items])

  return (
    <div className="h-full w-full relative">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={12}
          styles={AZEN_MAP_STYLE}
          disableDefaultUI={true}
          mapId="AZEN_PLANNER_MAP"
        >
          {enrichedItems.map((item) => (
            <ActivityMarker 
                key={item.id} 
                item={item} 
                isHovered={hoveredId === item.id} 
            />
          ))}

          {/* Map Logic Helper */}
          <MapUpdater items={enrichedItems} />
        </Map>
      </APIProvider>

      {/* API Key Warning Overlay (for dev only) */}
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="absolute top-4 left-4 right-4 p-3 bg-[#1c315e]/90 text-white text-xs rounded-xl backdrop-blur-md z-10 border border-white/20 shadow-2xl flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
             </div>
             <p className="flex-1 opacity-90">
                <span className="font-bold">Azen Dev Mode:</span> Map is in simulation. Please add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to your environment to enable real-time tracking.
             </p>
        </div>
      )}
    </div>
  )
}
