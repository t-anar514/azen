import { useTranslations } from "next-intl"
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
  Calendar,
  Camera,
  Landmark,
  Castle,
  Sparkles,
  Building2,
  Pizza,
  Wine,
  Beer,
  Cake,
  Car,
  Bus,
  Train as Tram,
  Bike,
  Hotel,
  Home,
  Tent,
  Bed,
  ShoppingCart,
  Gift,
  Tag,
  Activity,
  Music,
  Heart,
  Star,
  Ticket,
  Map as MapIcon
} from "lucide-react"
import { ItemType, ActivityType } from "./Timeline"

interface TimelineItemProps extends ItemType {
  index: number
  onUpdate: (updates: Partial<ItemType>) => void
  onDelete: () => void
  onHover: () => void
  onLeave: () => void
  isPickingLocation?: boolean
  onStartPicking?: () => void
  onCancelPicking?: () => void
  isNew?: boolean
  autoEdit?: boolean
}

export function TimelineItem({ 
  id, title, date, type, location, cost, lat, lng, index,
  onUpdate, onDelete, onHover, onLeave, 
  isPickingLocation, onStartPicking, onCancelPicking,
  isNew, autoEdit
}: TimelineItemProps) {
  const t = useTranslations("Planner.item")
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
  const cardRef = useRef<HTMLDivElement>(null)

  // Scroll into view on creation
  useEffect(() => {
    if (isNew && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    if (autoEdit) {
      setIsEditing(true)
    }
  }, [isNew, autoEdit])

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

  const iconCategories = [
    {
      id: "sights",
      label: "Sights",
      icons: [
        { type: "spot", icon: MapPin, color: "text-red-500", label: "Marker" },
        { type: "photo", icon: Camera, color: "text-pink-500", label: "Photo" },
        { type: "landmark", icon: Landmark, color: "text-amber-600", label: "Landmark" },
        { type: "castle", icon: Castle, color: "text-orange-700", label: "Castle" },
        { type: "special", icon: Sparkles, color: "text-yellow-400", label: "Special" },
        { type: "city", icon: Building2, color: "text-blue-700", label: "City" },
      ]
    },
    {
      id: "food",
      label: "Food",
      icons: [
        { type: "meal", icon: Utensils, color: "text-orange-500", label: "Meal" },
        { type: "cafe", icon: Coffee, color: "text-yellow-700", label: "Cafe" },
        { type: "pizza", icon: Pizza, color: "text-red-400", label: "Pizza" },
        { type: "wine", icon: Wine, color: "text-purple-600", label: "Wine" },
        { type: "beer", icon: Beer, color: "text-amber-500", label: "Beer" },
        { type: "dessert", icon: Cake, color: "text-pink-400", label: "Dessert" },
      ]
    },
    {
      id: "transport",
      label: "Transport",
      icons: [
        { type: "train", icon: Tram, color: "text-teal-500", label: "Train" },
        { type: "flight", icon: Plane, color: "text-blue-500", label: "Flight" },
        { type: "car", icon: Car, color: "text-gray-600", label: "Car" },
        { type: "bus", icon: Bus, color: "text-green-600", label: "Bus" },
        { type: "tram", icon: Tram, color: "text-blue-400", label: "Tram" },
        { type: "bike", icon: Bike, color: "text-emerald-500", label: "Bike" },
      ]
    },
    {
      id: "stay",
      label: "Stay",
      icons: [
        { type: "hotel", icon: Hotel, color: "text-purple-500", label: "Hotel" },
        { type: "house", icon: Home, color: "text-indigo-500", label: "House" },
        { type: "camp", icon: Tent, color: "text-orange-600", label: "Camp" },
        { type: "sleep", icon: Bed, color: "text-blue-600", label: "Sleep" },
      ]
    },
    {
      id: "shop",
      label: "Shop",
      icons: [
        { type: "shopping", icon: ShoppingBag, color: "text-pink-500", label: "Shop" },
        { type: "market", icon: ShoppingCart, color: "text-red-600", label: "Market" },
        { type: "gift", icon: Gift, color: "text-rose-400", label: "Gift" },
        { type: "sale", icon: Tag, color: "text-blue-500", label: "Sale" },
      ]
    },
    {
      id: "other",
      label: "Other",
      icons: [
        { type: "activity", icon: Activity, color: "text-lime-600", label: "Action" },
        { type: "music", icon: Music, color: "text-fuchsia-500", label: "Music" },
        { type: "love", icon: Heart, color: "text-red-500", label: "Love" },
        { type: "star", icon: Star, color: "text-yellow-500", label: "Star" },
        { type: "ticket", icon: Ticket, color: "text-cyan-600", label: "Ticket" },
      ]
    }
  ]

  const [activeCategory, setActiveCategory] = useState(iconCategories[0].id)
  
  const allIcons = iconCategories.flatMap(c => c.icons)
  
  // Refined current icon lookup
  const findIconData = (t: string) => allIcons.find(a => a.type === t) || allIcons[0]
  const viewIconData = findIconData(type)
  const editIconData = findIconData(editType)

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const handleCostChange = (val: string) => {
    const numericValue = parseInt(val.replace(/,/g, ''), 10)
    if (isNaN(numericValue)) {
      setEditCost(0)
    } else {
      setEditCost(numericValue)
    }
  }

  const addAmount = (amount: number) => {
    setEditCost(prev => prev + amount)
  }

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="mb-4">
        <Card className={`p-6 space-y-6 border-2 border-accent shadow-xl bg-card ${isNew ? 'animate-pulse-highlight' : ''}`}>
          <div className="flex justify-between items-center bg-muted/50 -m-6 mb-6 p-4 rounded-t-lg">
            <h5 className="font-black uppercase tracking-widest text-xs text-primary/60">{t("edit")}</h5>
            <div className="flex gap-2">
               <Button onClick={onDelete} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                 <Trash2 className="h-4 w-4" />
               </Button>
               <Button onClick={handleCancel} variant="ghost" size="icon" className="h-8 w-8">
                 <X className="h-4 w-4" />
               </Button>
            </div>
          </div>

          <div className={`space-y-4 pt-2 transition-all duration-500 ${isPickingLocation ? 'opacity-20 pointer-events-none scale-95 blur-sm' : 'opacity-100'}`}>
            {/* Categorized Icon Picker */}
            <div className="space-y-3">
              <div className="flex border-b border-muted overflow-x-auto scrollbar-hide">
                {iconCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                      activeCategory === cat.id 
                        ? "border-accent text-accent" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-6 gap-2 py-2">
                {iconCategories.find(c => c.id === activeCategory)?.icons.map((a, i) => {
                  const Icon = a.icon
                  const isSelected = editType === a.type
                  return (
                    <button
                      key={`${a.type}-${i}`}
                      onClick={() => setEditType(a.type as ActivityType)}
                      className={`p-3 rounded-xl transition-all border-2 flex items-center justify-center ${
                        isSelected
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
            </div>

            <div className="grid gap-3 pb-2">
              <div className="relative">
                <Input 
                  type="date"
                  value={editDate} 
                  onChange={(e) => setEditDate(e.target.value)} 
                  className="pl-10 h-12 bg-muted/30"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="relative">
                <Input 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  placeholder={t("titlePlaceholder")}
                  className="font-bold text-lg h-12 bg-muted/30"
                />
                <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-accent/20 text-accent hover:bg-accent/20 border-none font-mono">#{index}</Badge>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    value={editLocation} 
                    onChange={(e) => {
                      setEditLocation(e.target.value)
                      searchLocation(e.target.value)
                    }} 
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    onFocus={() => editLocation.length >= 2 && setShowResults(true)}
                    placeholder={t("locationPlaceholder")}
                    className="pr-10 h-12 bg-muted/30"
                  />
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border-2 border-accent rounded-xl shadow-2xl z-[110] overflow-hidden max-h-[200px] overflow-y-auto">
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
                
                <Button 
                  type="button"
                  variant="outline" 
                  className={`h-12 w-12 p-0 shrink-0 border-2 transition-all ${isPickingLocation ? 'bg-accent border-accent text-white animate-pulse' : 'hover:border-accent hover:text-accent'}`}
                  onClick={onStartPicking}
                  title="Pick on Map"
                >
                  <MapIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">¥</span>
                  <Input 
                    type="text"
                    value={formatCurrency(editCost)} 
                    onChange={(e) => handleCostChange(e.target.value)} 
                    className="pl-8 font-mono h-12 bg-muted/30 text-lg"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {[1000, 5000, 10000].map(amount => (
                    <Button 
                      key={amount}
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addAmount(amount)}
                      className="h-8 font-mono text-[10px] rounded-full border-muted-foreground/20 hover:border-accent hover:text-accent"
                    >
                      +{formatCurrency(amount)}
                    </Button>
                  ))}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditCost(0)}
                    className="h-8 font-mono text-[10px] rounded-full text-muted-foreground hover:text-destructive"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <span className="flex-1">
                <Button 
                  onClick={handleSave} 
                  disabled={!editTitle || !editLocation || !editDate}
                  className="w-full bg-accent text-white rounded-full font-bold uppercase tracking-wider h-14 shadow-lg shadow-accent/20 hover:shadow-accent/40 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  <Check className="h-5 w-5 mr-2" /> {t("done")}
                </Button>
              </span>
              <span className="flex-1">
                <Button onClick={handleCancel} variant="ghost" className="w-full rounded-full font-bold uppercase tracking-wider h-14 hover:bg-muted">
                   {t("cancel")}
                </Button>
              </span>
            </div>
          </div>

          {/* Map Picking Overlay */}
          {isPickingLocation && (
            <div className="absolute inset-x-6 top-[150px] bottom-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300 pointer-events-none">
              <div className="bg-accent text-white px-6 py-4 rounded-3xl shadow-2xl pointer-events-auto flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-black uppercase tracking-tighter text-sm">Газрын зураг дээр товших</p>
                  <p className="text-[10px] opacity-80">Байршлаа сонгохын тулд зураг дээр дарна уу</p>
                </div>
                <Button size="sm" variant="secondary" className="mt-2 rounded-full h-8 px-4 text-[10px] font-bold uppercase" onClick={onCancelPicking}>
                  Цуцлах
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div 
        ref={(node) => {
          setNodeRef(node)
          // @ts-ignore
          cardRef.current = node
        }} 
        style={style} 
        className="mb-4 group relative"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
    >
      <Card 
        className={`p-4 flex gap-4 items-center bg-card transition-all border-l-4 border-l-primary/10 hover:border-l-accent hover:shadow-lg ${isDragging ? 'opacity-50' : ''} ${isNew ? 'animate-pulse-highlight border-accent' : ''}`}
      >
        <div className="text-muted-foreground cursor-grab active:cursor-grabbing flex flex-col items-center gap-1" {...attributes} {...listeners}>
            <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:scale-110 transition-transform">
              <span className="text-[10px] font-black text-accent">{index}</span>
            </div>
            <MoveVertical className="h-3 w-3 opacity-0 group-hover:opacity-30" />
        </div>
        
        <div className="flex-1 flex gap-4 items-center">
            <div className="flex flex-col items-center justify-center h-12 w-12 rounded-2xl bg-muted/50 shrink-0 border border-secondary/10 group-hover:bg-accent/5 transition-colors">
              <viewIconData.icon className={`h-6 w-6 ${viewIconData.color || 'text-primary'}`} />
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
