import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plane, 
  MapPin, 
  Coffee, 
  Utensils, 
  ShoppingBag, 
  Train, 
  MoveVertical, 
  Pencil, 
  Check, 
  X, 
  Trash2,
  Clock,
  Calendar
} from "lucide-react"
import { ItemType, ActivityType } from "./Timeline"

interface TimelineItemProps extends ItemType {
  onUpdate: (updates: Partial<ItemType>) => void
  onDelete: () => void
  onHover: () => void
  onLeave: () => void
}

export function TimelineItem({ id, title, date, type, location, cost, lat, lng, onUpdate, onDelete, onHover, onLeave }: TimelineItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editLocation, setEditLocation] = useState(location)
  const [editCost, setEditCost] = useState(cost)
  const [editType, setEditType] = useState<ActivityType>(type)
  const [editDate, setEditDate] = useState(date)
  const [editLat, setEditLat] = useState(lat)
  const [editLng, setEditLng] = useState(lng)
  
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  // Use Photon API for free, open-source geocoding (no API key required)
  const searchLocation = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`)
      const data = await response.json()
      setSearchResults(data.features || [])
      setShowResults(true)
    } catch (error) {
      console.error("Search failed:", error)
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled: isEditing })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  const activityIcons: { type: ActivityType; icon: any; color: string; label: string }[] = [
    { type: "flight", icon: Plane, color: "text-blue-500", label: "Flight" },
    
    { type: "spot", icon: MapPin, color: "text-red-500", label: "Shrine/Spot" },
    { type: "food", icon: Utensils, color: "text-orange-500", label: "Food" },
    { type: "hotel", icon: Coffee, color: "text-purple-500", label: "Hotel" },
    { type: "shopping", icon: ShoppingBag, color: "text-pink-500", label: "Shopping" },
    { type: "transport", icon: Train, color: "text-teal-500", label: "Transport" },
  ]

  const currentIconData = activityIcons.find(a => a.type === (isEditing ? editType : type))
  const DynamicIcon = currentIconData?.icon || MapPin

  const handleSave = () => {
    onUpdate({
      title: editTitle,
      location: editLocation,
      cost: editCost,
      type: editType,
      date: editDate,
      lat: editLat,
      lng: editLng
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(title)
    setEditLocation(location)
    setEditCost(cost)
    setEditType(type)
    setEditDate(date)
    setEditLat(lat)
    setEditLng(lng)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="mb-4">
        <Card className="p-6 space-y-6 border-2 border-accent shadow-xl bg-card">
          <div className="flex justify-between items-center bg-muted/50 -m-6 mb-6 p-4 rounded-t-lg">
            <h5 className="font-black uppercase tracking-widest text-xs text-primary/60">Edit Activity</h5>
            <div className="flex gap-2">
               <Button onClick={onDelete} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                 <Trash2 className="h-4 w-4" />
               </Button>
               <Button onClick={handleCancel} variant="ghost" size="icon" className="h-8 w-8">
                 <X className="h-4 w-4" />
               </Button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Icon Picker */}
            <div className="flex flex-wrap gap-2 justify-center pb-2">
              {activityIcons.map((a) => {
                const Icon = a.icon
                return (
                  <button
                    key={a.type}
                    onClick={() => setEditType(a.type)}
                    className={`p-3 rounded-2xl transition-all border-2 ${
                      editType === a.type 
                        ? "bg-accent/10 border-accent text-accent scale-110 shadow-sm" 
                        : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"
                    }`}
                    title={a.label}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                )
              })}
            </div>

            <div className="grid gap-3 pb-2">
              <div className="relative">
                <Input 
                  type="date"
                  value={editDate} 
                  onChange={(e) => setEditDate(e.target.value)} 
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="grid gap-3">
              <Input 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                placeholder="Activity Title"
                className="font-bold text-lg"
              />
              <div className="relative">
                <Input 
                  value={editLocation} 
                  onChange={(e) => {
                    setEditLocation(e.target.value)
                    searchLocation(e.target.value)
                  }} 
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  onFocus={() => editLocation.length >= 2 && setShowResults(true)}
                  placeholder="Search Location (e.g. Shinjuku)..."
                  className="pr-10"
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-accent rounded-xl shadow-2xl z-[100] overflow-hidden max-h-[250px] overflow-y-auto">
                    {searchResults.map((feature, index) => {
                       const { name, city, country } = feature.properties
                       const label = [name, city, country].filter(Boolean).join(", ")
                       return (
                         <button
                           key={index}
                           className="w-full text-left p-3 hover:bg-accent/10 transition-colors border-b last:border-b-0 flex items-start gap-3"
                           onClick={() => {
                             setEditLocation(name || label)
                             setEditLat(feature.geometry.coordinates[1])
                             setEditLng(feature.geometry.coordinates[0])
                             setShowResults(false)
                           }}
                         >
                           <MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                           <div className="min-w-0">
                             <div className="font-bold text-sm truncate">{name || label}</div>
                             <div className="text-[10px] text-muted-foreground truncate">{label}</div>
                           </div>
                         </button>
                       )
                    })}
                  </div>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">¥</span>
                <Input 
                  type="number"
                  value={editCost} 
                  onChange={(e) => setEditCost(Number(e.target.value))} 
                  className="pl-8 font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} className="flex-1 bg-accent text-white rounded-full font-bold uppercase tracking-wider h-12">
                <Check className="h-4 w-4 mr-2" /> Done
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1 rounded-full font-bold uppercase tracking-wider h-12">
                 Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        className="mb-4 group relative"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
    >
      <Card 
        className={`p-4 flex gap-4 items-center bg-card transition-all border-l-4 border-l-primary/10 hover:border-l-accent hover:shadow-lg ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="text-muted-foreground cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <MoveVertical className="h-4 w-4 opacity-0 group-hover:opacity-50" />
        </div>
        
        <div className="flex-1 flex gap-4 items-center">
            <div className="flex flex-col items-center justify-center h-12 w-12 rounded-2xl bg-muted/50 shrink-0 border border-secondary/10">
              <DynamicIcon className={`h-6 w-6 ${currentIconData?.color || 'text-primary'}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                 <h4 className="font-bold text-lg truncate text-primary">{title}</h4>
                 <div className="flex flex-wrap gap-2 text-[10px] font-mono text-muted-foreground">
                    <div className="flex items-center bg-secondary/10 px-2 py-0.5 rounded-full">
                       <Calendar className="h-3 w-3 mr-1" />
                       {new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                 </div>
              </div>
              <p className="text-sm text-muted-foreground truncate">{location}</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="text-right">
                 <Badge variant="outline" className="font-mono text-primary border-primary/20 bg-primary/5">
                   ¥{cost.toLocaleString()}
                 </Badge>
            </div>
            
            <Button 
                onClick={() => setIsEditing(true)}
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all shadow-sm shrink-0"
            >
                <Pencil className="h-4 w-4 font-bold" />
            </Button>
        </div>
      </Card>
      
      {/* Visual connector line */}
      <div className="h-4 w-0.5 bg-border mx-auto my-1 group-last:hidden ml-[3.25rem] opacity-30" /> 
    </div>
  )
}
