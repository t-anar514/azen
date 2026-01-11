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
  MoveVertical, 
  Pencil, 
  Check, 
  X, 
  Trash2,
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
  Map as MapIcon,
  ChevronDown
} from "lucide-react"
import { ItemType, ActivityType } from "./Timeline"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

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
  isCompact?: boolean
  currency?: "MNT" | "USD" | "JPY"
}

interface GeocodeFeature {
  geometry: {
    coordinates: [number, number]
  }
  properties: {
    name: string
    city?: string
    country?: string
  }
}

export function TimelineItem({ 
  id, title, date, type, location, cost, lat, lng, index,
  onUpdate, onDelete, onHover, onLeave, 
  isPickingLocation, onStartPicking, onCancelPicking,
  isNew, autoEdit, isCompact,
  currency = "JPY"
}: TimelineItemProps) {
  const t = useTranslations("Planner.item")
  const [isEditing, setIsEditing] = useState(autoEdit || false)
  const [editTitle, setEditTitle] = useState(title)
  const [editLocation, setEditLocation] = useState(location)
  const [editCost, setEditCost] = useState(cost)
  const [editType, setEditType] = useState<ActivityType>(type)
  const [editDate, setEditDate] = useState(date)
  const [editLat, setEditLat] = useState(lat)
  const [editLng, setEditLng] = useState(lng)
  
  const [searchResults, setSearchResults] = useState<GeocodeFeature[]>([])
  const [showResults, setShowResults] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isNew && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [isNew])

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
    switch(currency) {
      case "MNT": return `₮ ${(value * 22).toLocaleString()}`
      case "USD": return `$ ${(value / 150).toFixed(2)}`
      default: return `¥${new Intl.NumberFormat('en-US').format(value)}`
    }
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
    const EditIcon = editIconData.icon
    return (
      <div ref={setNodeRef} style={style} className="mb-3">
        <Card className={`p-3 md:p-4 space-y-3 md:space-y-4 border-2 border-accent shadow-xl bg-card overflow-hidden ${isNew ? 'animate-pulse-highlight' : ''}`}>
          <div className="flex justify-between items-center -mx-3 md:-mx-4 -mt-3 md:-mt-4 mb-2 p-2.5 md:p-3 bg-muted/30 border-b border-border/50">
            <h5 className="font-black uppercase tracking-widest text-[9px] md:text-[10px] text-primary/60">{t("edit")}</h5>
            <div className="flex gap-1">
               <Button onClick={onDelete} variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10">
                 <Trash2 className="h-3.5 w-3.5" />
               </Button>
               <Button onClick={handleCancel} variant="ghost" size="icon" className="h-7 w-7">
                 <X className="h-3.5 w-3.5" />
               </Button>
            </div>
          </div>

          <div className={`space-y-3 transition-all duration-500 ${isPickingLocation ? 'opacity-20 pointer-events-none scale-95 blur-sm' : 'opacity-100'}`}>
            <div className="flex gap-3">
              {/* Popover Icon Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="h-12 w-12 p-0 flex-shrink-0 border-2 border-dashed border-accent/20 hover:border-accent hover:bg-accent/5 transition-all group rounded-xl"
                  >
                    <div className="relative">
                      <EditIcon className={`h-6 w-6 ${editIconData.color || 'text-accent'}`} />
                      <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-0.5 shadow-sm group-hover:scale-110 transition-transform">
                        <ChevronDown className="h-2 w-2 text-white" />
                      </div>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-2 overflow-hidden rounded-2xl border-2 border-accent shadow-2xl" side="bottom" align="start">
                  <div className="grid grid-cols-6 gap-2.5 p-1">
                    {allIcons.map((a, i) => {
                      const Icon = a.icon
                      const isSelected = editType === a.type
                      return (
                        <button
                          key={`${a.type}-${i}`}
                          onClick={() => setEditType(a.type as ActivityType)}
                          className={`aspect-square rounded-xl transition-all border-2 flex items-center justify-center group ${
                            isSelected
                              ? "bg-accent/10 border-accent text-accent scale-105 shadow-sm" 
                              : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
                          }`}
                          title={a.label}
                        >
                          <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                        </button>
                      )
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="relative flex-1">
                <Input 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  placeholder={t("titlePlaceholder")}
                  className="font-bold text-base h-12 bg-muted/20 border-none shadow-none focus-visible:ring-1 focus-visible:ring-accent/30 rounded-xl"
                />
                <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-accent/10 text-accent hover:bg-accent/10 border-none font-mono text-[10px]">#{index}</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-[1.4]">
                <Input 
                  value={editLocation} 
                  onChange={(e) => {
                    setEditLocation(e.target.value)
                    searchLocation(e.target.value)
                  }} 
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  onFocus={() => editLocation.length >= 2 && setShowResults(true)}
                  placeholder={t("locationPlaceholder")}
                  className="pl-9 pr-10 h-10 bg-muted/20 border-none shadow-none text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-accent/30"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Button 
                  type="button"
                  variant="ghost" 
                  className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 shrink-0 transition-all rounded-lg ${isPickingLocation ? 'bg-accent text-white scale-90' : 'text-muted-foreground hover:text-accent'}`}
                  onClick={onStartPicking}
                  title="Pick on Map"
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
                
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-accent rounded-xl shadow-2xl z-[110] overflow-hidden max-h-[200px] overflow-y-auto">
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

              <div className="relative flex-1">
                <Input 
                  type="date"
                  value={editDate} 
                  onChange={(e) => setEditDate(e.target.value)} 
                  className="pl-9 h-10 bg-muted/20 border-none shadow-none text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-accent/30"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="bg-muted/20 rounded-2xl p-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">¥</span>
                  <Input 
                    type="text"
                    value={formatCurrency(editCost)} 
                    onChange={(e) => handleCostChange(e.target.value)} 
                    className="pl-7 font-mono h-10 bg-white border-muted/50 text-sm rounded-xl focus-visible:ring-accent/30"
                  />
                </div>
                
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
                  {[1000, 5000].map(amount => (
                    <Button 
                      key={amount}
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addAmount(amount)}
                      className="h-8 px-3 font-mono text-[10px] rounded-full border-muted text-muted-foreground hover:border-accent hover:text-accent bg-white"
                    >
                      +{formatCurrency(amount)}
                    </Button>
                  ))}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditCost(0)}
                    className="h-8 px-2 font-mono text-[10px] rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSave} 
                disabled={!editTitle || !editLocation || !editDate}
                className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold uppercase tracking-wider h-11 text-xs shadow-lg shadow-accent/20 transition-all"
              >
                <Check className="h-4 w-4 mr-2" /> {t("done")}
              </Button>
              <Button onClick={handleCancel} variant="ghost" className="flex-1 rounded-xl font-bold uppercase tracking-wider h-11 text-xs hover:bg-muted text-muted-foreground">
                 {t("cancel")}
              </Button>
            </div>
          </div>

          {/* Map Picking Overlay */}
          {isPickingLocation && (
            <div className="absolute inset-4 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in zoom-in duration-300 pointer-events-none">
              <div className="bg-accent text-white px-5 py-4 rounded-2xl shadow-2xl pointer-events-auto flex flex-col items-center gap-2 max-w-[200px]">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="font-black uppercase tracking-tighter text-[10px]">Газрын зураг дээр товших</p>
                  <p className="text-[9px] opacity-80 leading-tight">Сонгохын тулд зураг дээр дарна уу</p>
                </div>
                <Button size="sm" variant="secondary" className="mt-1 rounded-lg h-7 px-3 text-[9px] font-bold uppercase w-full bg-white text-accent hover:bg-white/90" onClick={onCancelPicking}>
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
          cardRef.current = node as HTMLDivElement
        }} 
        style={style} 
        className={`${isCompact ? 'mb-1' : 'mb-4'} group relative`}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
    >
      <Card 
        className={`
          w-full flex gap-2 md:gap-4 items-center bg-card transition-all border-l-4 border-l-primary/10 hover:border-l-accent hover:shadow-lg
          ${isDragging ? 'opacity-50' : ''} 
          ${isNew ? 'animate-pulse-highlight border-accent' : ''}
          ${isCompact ? 'p-2 rounded-lg' : 'p-3 md:p-4'}
        `}
      >
        {/* Left Column: Drag & Index */}
        <div className={`text-muted-foreground cursor-grab active:cursor-grabbing flex flex-col items-center justify-center gap-1 shrink-0 ${isCompact ? 'w-6' : 'w-8 md:w-10'}`} {...attributes} {...listeners}>
            <div className={`${isCompact ? 'h-5 w-5' : 'h-6 w-6 md:h-7 md:w-7'} rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:scale-110 transition-transform`}>
              <span className={`${isCompact ? 'text-[8px]' : 'text-[10px] md:text-xs'} font-black text-accent`}>{index}</span>
            </div>
            {!isCompact && <MoveVertical className="h-3 w-3 opacity-30 md:opacity-0 group-hover:opacity-30" />}
        </div>
        
        {/* Middle Body: Icon & Content */}
        <div className="flex-1 flex gap-2 md:gap-3 items-center min-w-0">
            <div className={`flex flex-col items-center justify-center rounded-xl bg-muted/50 shrink-0 border border-secondary/10 group-hover:bg-accent/5 transition-colors ${isCompact ? 'h-8 w-8' : 'h-10 w-10 md:h-12 md:w-12'}`}>
              <viewIconData.icon className={`${isCompact ? 'h-4 w-4' : 'h-5 w-5 md:h-6 md:w-6'} ${viewIconData.color || 'text-primary'}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-0.5">
                 <h4 className={`font-bold truncate text-primary ${isCompact ? 'text-xs' : 'text-sm md:text-lg'}`}>{title}</h4>
                 <div className="flex items-center bg-secondary/10 px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-mono text-muted-foreground shrink-0 border border-secondary/5">
                    <Calendar className="h-2.5 w-2.5 mr-1 overflow-hidden" />
                    {new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                 </div>
              </div>
              {!isCompact && <p className="text-[10px] md:text-sm text-muted-foreground truncate opacity-80">{location}</p>}
            </div>
        </div>

        {/* Right Column: Cost & Actions */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            <div className="text-right">
                 <Badge variant="outline" className={`font-mono text-primary border-primary/20 bg-primary/5 px-1.5 md:px-2.5 ${isCompact ? 'text-[9px] py-0 h-4 md:h-5' : 'text-[10px] md:text-sm'}`}>
                   ¥{cost.toLocaleString()}
                 </Badge>
            </div>
            
            <Button 
                onClick={() => setIsEditing(true)}
                variant="ghost" 
                size="icon" 
                className={`rounded-full shadow-sm shrink-0 border border-muted/10 transition-all ${isCompact ? 'h-7 w-7' : 'h-9 w-9 md:h-11 md:w-11'} text-muted-foreground hover:text-accent hover:bg-accent/10`}
            >
                <Pencil className={`${isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4 md:h-5 md:w-5'} font-bold`} />
            </Button>
        </div>
      </Card>
      
      {/* Visual connector line */}
      <div className={`bg-border mx-auto md:mx-0 group-last:hidden opacity-30 ${isCompact ? 'h-2 w-0.5 my-0.5 ml-[2.35rem]' : 'h-4 w-0.5 my-1 ml-[3.25rem]'}`} /> 
    </div>
  )
}
