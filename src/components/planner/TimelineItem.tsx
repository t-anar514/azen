import { useTranslations } from "next-intl"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { LucideIcon } from "lucide-react"
import {
  Plane,
  MapPin,
  Coffee,
  Utensils,
  ShoppingBag,
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
  ChevronDown,
  PencilLine,
  StickyNote
} from "lucide-react"
import { ItemType, ActivityType } from "./Timeline"
import { formatCurrency as formatCurrencyShared, FALLBACK_RATES, Rates } from "@/lib/currency/format"
import { formatMnShort } from "@/lib/planner/format"
import type { TripParticipant, CostSplit } from "@/lib/budget/splitBalances"
import { participantInitial } from "./ParticipantChips"

// ── Activity icon catalog ────────────────────────────────────────────────
// Grouped into the picker's category tabs. `id` and `type` double as the
// translation keys (Planner.item.categories.* / Planner.item.icons.*), so
// adding an icon is one entry here plus one message in mn.json.
type IconEntry = {
  type: ActivityType
  icon: LucideIcon
  /** icon color */
  color: string
  /** pastel tile fill behind the icon + label */
  tint: string
}

type IconCategory = { id: string; icons: IconEntry[] }

const ICON_CATEGORIES: IconCategory[] = [
  {
    id: "sights",
    icons: [
      { type: "spot", icon: MapPin, color: "text-red-500", tint: "bg-red-50" },
      { type: "photo", icon: Camera, color: "text-pink-500", tint: "bg-pink-50" },
      { type: "landmark", icon: Landmark, color: "text-amber-600", tint: "bg-amber-50" },
      { type: "castle", icon: Castle, color: "text-orange-700", tint: "bg-orange-50" },
      { type: "special", icon: Sparkles, color: "text-sky-500", tint: "bg-sky-50" },
      { type: "city", icon: Building2, color: "text-blue-700", tint: "bg-blue-50" },
    ],
  },
  {
    id: "food",
    icons: [
      { type: "meal", icon: Utensils, color: "text-orange-500", tint: "bg-orange-50" },
      { type: "cafe", icon: Coffee, color: "text-yellow-700", tint: "bg-yellow-50" },
      { type: "pizza", icon: Pizza, color: "text-red-400", tint: "bg-red-50" },
      { type: "wine", icon: Wine, color: "text-purple-600", tint: "bg-purple-50" },
      { type: "beer", icon: Beer, color: "text-amber-500", tint: "bg-amber-50" },
      { type: "dessert", icon: Cake, color: "text-pink-400", tint: "bg-pink-50" },
    ],
  },
  {
    id: "transport",
    icons: [
      { type: "train", icon: Tram, color: "text-teal-500", tint: "bg-teal-50" },
      { type: "flight", icon: Plane, color: "text-blue-500", tint: "bg-blue-50" },
      { type: "car", icon: Car, color: "text-gray-600", tint: "bg-gray-100" },
      { type: "bus", icon: Bus, color: "text-green-600", tint: "bg-green-50" },
      { type: "tram", icon: Tram, color: "text-blue-400", tint: "bg-blue-50" },
      { type: "bike", icon: Bike, color: "text-emerald-500", tint: "bg-emerald-50" },
    ],
  },
  {
    id: "stay",
    icons: [
      { type: "hotel", icon: Hotel, color: "text-purple-500", tint: "bg-purple-50" },
      { type: "house", icon: Home, color: "text-indigo-500", tint: "bg-indigo-50" },
      { type: "camp", icon: Tent, color: "text-orange-600", tint: "bg-orange-50" },
      { type: "sleep", icon: Bed, color: "text-blue-600", tint: "bg-blue-50" },
    ],
  },
  {
    id: "shop",
    icons: [
      { type: "shopping", icon: ShoppingBag, color: "text-pink-500", tint: "bg-pink-50" },
      { type: "market", icon: ShoppingCart, color: "text-red-600", tint: "bg-red-50" },
      { type: "gift", icon: Gift, color: "text-rose-400", tint: "bg-rose-50" },
      { type: "sale", icon: Tag, color: "text-blue-500", tint: "bg-blue-50" },
    ],
  },
  {
    id: "other",
    icons: [
      { type: "activity", icon: Activity, color: "text-lime-600", tint: "bg-lime-50" },
      { type: "music", icon: Music, color: "text-fuchsia-500", tint: "bg-fuchsia-50" },
      { type: "love", icon: Heart, color: "text-red-500", tint: "bg-red-50" },
      { type: "star", icon: Star, color: "text-yellow-500", tint: "bg-yellow-50" },
      { type: "ticket", icon: Ticket, color: "text-cyan-600", tint: "bg-cyan-50" },
    ],
  },
]

const ALL_ICONS = ICON_CATEGORIES.flatMap((c) => c.icons)

/** Icon metadata for an activity type, falling back to the marker for the
 *  legacy types (food/transport/nature/…) that predate this catalog. */
const findIconData = (type: string): IconEntry =>
  ALL_ICONS.find((a) => a.type === type) ?? ALL_ICONS[0]

const categoryOf = (type: string): string =>
  ICON_CATEGORIES.find((c) => c.icons.some((i) => i.type === type))?.id ?? ICON_CATEGORIES[0].id

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
  rates?: Rates
  // Budget splitting — only provided for cloud trips with a participant roster.
  participants?: TripParticipant[]
  split?: CostSplit | null
  onSplitChange?: (paidBy: string | null, splitBetween: string[]) => void
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
  id, title, date, type, location, cost, lat, lng, notes, index,
  onUpdate, onDelete, onHover, onLeave,
  isPickingLocation, onStartPicking, onCancelPicking,
  isNew, autoEdit, isCompact,
  currency = "JPY",
  rates = FALLBACK_RATES,
  participants,
  split = null,
  onSplitChange
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
  const [editNotes, setEditNotes] = useState(notes ?? "")
  // Which tab of the inline type picker is showing — seeded from the item's
  // own type so opening the form lands on the group it already belongs to.
  const [activeCategory, setActiveCategory] = useState(() => categoryOf(type))
  // Split defaults: nobody marked as payer until picked; split between
  // everyone currently on the trip.
  const [editPaidBy, setEditPaidBy] = useState<string | null>(split?.paidBy ?? null)
  const [editSplitBetween, setEditSplitBetween] = useState<string[]>(
    split?.splitBetween ?? (participants ?? []).map((p) => p.id)
  )

  const [searchResults, setSearchResults] = useState<GeocodeFeature[]>([])
  const [showResults, setShowResults] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Below md the form is presented as a bottom sheet (design: mobile column),
  // above it stays inline in the timeline. Resolved post-mount so the SSR pass
  // and hydration always agree on the desktop tree.
  const [isDesktop, setIsDesktop] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // The sheet owns the viewport while it's open — stop the page behind it from
  // scrolling under the user's thumb.
  useEffect(() => {
    if (!isEditing || isDesktop) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previous }
  }, [isEditing, isDesktop])

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

  const viewIconData = findIconData(type)
  const editIconData = findIconData(editType)
  const activeIcons = ICON_CATEGORIES.find((c) => c.id === activeCategory)?.icons ?? ALL_ICONS

  const handleSave = () => {
    const trimmedNotes = editNotes.trim()
    onUpdate({
      title: editTitle,
      location: editLocation,
      cost: editCost,
      type: editType,
      date: editDate,
      lat: editLat,
      lng: editLng,
      // Cleared notes are written back as undefined rather than "" so the item
      // that lands in the jsonb column stays as small as it was before.
      notes: trimmedNotes ? trimmedNotes : undefined
    })
    if (onSplitChange && (participants?.length ?? 0) > 0) {
      onSplitChange(editPaidBy, editSplitBetween)
    }
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
    setEditNotes(notes ?? "")
    setActiveCategory(categoryOf(type))
    setEditPaidBy(split?.paidBy ?? null)
    setEditSplitBetween(split?.splitBetween ?? (participants ?? []).map((p) => p.id))
    setIsEditing(false)
  }

  // Entry point for the pencil button: (re)seed split-picker state here, not
  // just in useState — participants load async after mount, so mount-time
  // defaults can be stale by the time editing actually starts.
  const startEditing = () => {
    setEditNotes(notes ?? "")
    setActiveCategory(categoryOf(type))
    setEditPaidBy(split?.paidBy ?? null)
    setEditSplitBetween(split?.splitBetween ?? (participants ?? []).map((p) => p.id))
    setIsEditing(true)
  }

  const toggleSplitBetween = (participantId: string) => {
    setEditSplitBetween((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    )
  }

  const formatCurrency = (value: number) => formatCurrencyShared(value, currency, rates)

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

    // ── Header: "ЗАСАХ" + delete / close ──
    const formHeader = (
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-3 py-2.5 md:px-4">
        <h5 className="text-[9px] font-black uppercase tracking-widest text-primary/60 md:text-[10px]">{t("edit")}</h5>
        <div className="flex gap-1.5">
          <Button
            onClick={onDelete}
            variant="ghost"
            size="icon"
            aria-label={t("delete")}
            className="h-8 w-8 rounded-lg bg-card text-destructive shadow-xs hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={handleCancel}
            variant="ghost"
            size="icon"
            aria-label={t("cancel")}
            className="h-8 w-8 rounded-lg bg-card text-muted-foreground shadow-xs hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )

    // ── Everything above the action buttons. Shared verbatim between the
    //    desktop inline card and the mobile bottom sheet. ──
    const formFields = (
      <div className="space-y-3">
        {/* current icon + title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory(categoryOf(editType))}
            aria-label={t("typeSection")}
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-accent bg-card transition-transform hover:scale-105"
          >
            <EditIcon className="h-5 w-5 text-accent" />
            <span className="absolute -bottom-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent shadow-sm">
              <ChevronDown className="h-2.5 w-2.5 text-white" />
            </span>
          </button>

          <div className="relative flex-1">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              className="h-12 rounded-xl border-none bg-muted/40 pr-12 text-[15px] font-semibold shadow-none focus-visible:ring-1 focus-visible:ring-accent/40"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
              #{index}
            </span>
          </div>
        </div>

        {/* ── inline type picker: category tabs + labelled icon tiles ── */}
        <div className="space-y-2.5 rounded-2xl border border-border/70 bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              <span className="md:hidden">{t("typeShort")}</span>
              <span className="hidden md:inline">{t("typeSection")}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground">
              <EditIcon className={`h-3.5 w-3.5 ${editIconData.color}`} />
              {t(`icons.${editIconData.type}`)}
            </span>
          </div>

          {/* category tabs — a scroll rail below md, all six fit above it */}
          <div className="-mx-1 flex gap-1.5 overflow-x-auto scrollbar-hide px-1 pb-0.5">
            {ICON_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                  activeCategory === c.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {t(`categories.${c.id}`)}
              </button>
            ))}
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto scrollbar-hide px-1 pb-1 md:grid md:grid-cols-6 md:overflow-visible md:pb-0">
            {activeIcons.map((a) => {
              const Icon = a.icon
              const isSelected = editType === a.type
              return (
                <button
                  key={a.type}
                  type="button"
                  onClick={() => setEditType(a.type)}
                  aria-pressed={isSelected}
                  className={`flex w-[62px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 transition-all md:w-auto ${
                    isSelected
                      ? "border-accent bg-card shadow-sm"
                      : `border-transparent ${a.tint} hover:brightness-95`
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${isSelected ? "text-accent" : a.color}`} />
                  <span
                    className={`max-w-full truncate px-1 text-[9px] font-semibold leading-none ${
                      isSelected ? "text-accent" : "text-foreground/70"
                    }`}
                  >
                    {t(`icons.${a.type}`)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* location + date */}
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
              className="h-11 rounded-xl border-none bg-muted/40 pl-9 pr-10 text-[13px] shadow-none focus-visible:ring-1 focus-visible:ring-accent/40"
            />
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Button
              type="button"
              variant="ghost"
              aria-label={t("pickOnMap")}
              title={t("pickOnMap")}
              className={`absolute right-1 top-1/2 h-8 w-8 shrink-0 -translate-y-1/2 rounded-lg p-0 transition-all ${
                isPickingLocation ? "scale-90 bg-accent text-white" : "text-primary hover:bg-secondary"
              }`}
              onClick={onStartPicking}
            >
              <MapIcon className="h-4 w-4" />
            </Button>

            {showResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-[110] mt-2 max-h-[200px] overflow-hidden overflow-y-auto rounded-xl border-2 border-accent bg-card shadow-2xl">
                {searchResults.map((feature, i) => {
                  const { name, city, country } = feature.properties
                  const label = [name, city, country].filter(Boolean).join(", ")
                  return (
                    <button
                      key={i}
                      className="flex w-full items-start gap-3 border-b p-3 text-left transition-colors last:border-b-0 hover:bg-accent/10"
                      onClick={() => {
                        setEditLocation(name || label)
                        setEditLat(feature.geometry.coordinates[1])
                        setEditLng(feature.geometry.coordinates[0])
                        setShowResults(false)
                      }}
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold">{name || label}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{label}</div>
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
              className="h-11 rounded-xl border-none bg-muted/40 pl-9 text-[13px] shadow-none focus-visible:ring-1 focus-visible:ring-accent/40"
            />
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* cost + quick-add chips */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">¥</span>
            <Input
              type="text"
              inputMode="numeric"
              value={editCost.toLocaleString("en-US")}
              onChange={(e) => handleCostChange(e.target.value)}
              className="h-11 rounded-xl border-border/70 bg-card pl-7 font-mono text-[13px] focus-visible:ring-accent/40"
            />
          </div>
          <div className="flex shrink-0 gap-1.5">
            {[1000, 5000].map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addAmount(amount)}
                className="h-9 rounded-full border-border/70 bg-card px-2.5 font-mono text-[10px] text-muted-foreground hover:border-accent hover:text-accent"
              >
                +{formatCurrency(amount)}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditCost(0)}
              className="h-9 rounded-full px-2 font-mono text-[10px] text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
            >
              {t("reset")}
            </Button>
          </div>
        </div>

        {/* ── notes ── */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <PencilLine className="h-3 w-3 text-accent" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              {t("notesLabel")}
            </span>
          </div>
          <Textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder={t("notesPlaceholder")}
            rows={3}
            maxLength={1000}
            className="min-h-[84px] resize-none rounded-xl border-border/50 bg-muted/40 text-[13px] leading-relaxed shadow-none focus-visible:ring-1 focus-visible:ring-accent/40"
          />
        </div>

        {/* who paid / who shares — only for cloud trips with a roster */}
        {onSplitChange && (participants?.length ?? 0) > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t("paidBy")}</p>
              <div className="flex flex-wrap gap-1.5">
                {participants!.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setEditPaidBy(editPaidBy === p.id ? null : p.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium transition-all ${
                      editPaidBy === p.id
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border/60 bg-card text-muted-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
                      style={{ backgroundColor: p.color ?? "#64748b" }}
                    >
                      {participantInitial(p.displayName)}
                    </span>
                    {p.displayName}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t("sharedWith")}</p>
              <div className="flex flex-wrap gap-1.5">
                {participants!.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleSplitBetween(p.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium transition-all ${
                      editSplitBetween.includes(p.id)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border/60 bg-card text-muted-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
                      style={{ backgroundColor: p.color ?? "#64748b" }}
                    >
                      {participantInitial(p.displayName)}
                    </span>
                    {p.displayName}
                    {editSplitBetween.includes(p.id) && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )

    // ── Done / cancel. Inline on desktop, pinned to the sheet on mobile. ──
    const formActions = (
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={!editTitle || !editLocation || !editDate}
          className="h-12 flex-1 rounded-xl bg-accent text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90"
        >
          <Check className="mr-1.5 h-4 w-4" /> {t("done")}
        </Button>
        <Button
          onClick={handleCancel}
          variant="outline"
          className="h-12 flex-1 rounded-xl border-border/60 bg-muted/40 text-xs font-black uppercase tracking-wider text-muted-foreground hover:bg-muted"
        >
          {t("cancel")}
        </Button>
      </div>
    )

    // Prompt shown while the user is dropping a pin on the map.
    const pickingPrompt = (
      <div className="flex max-w-[220px] flex-col items-center gap-2 rounded-2xl bg-accent px-5 py-4 text-center text-white shadow-2xl">
        <div className="flex h-10 w-10 animate-bounce items-center justify-center rounded-full bg-white/20">
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-tighter">{t("pickPromptTitle")}</p>
          <p className="text-[9px] leading-tight opacity-80">{t("pickPromptBody")}</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="mt-1 h-7 w-full rounded-lg bg-white px-3 text-[9px] font-bold uppercase text-accent hover:bg-white/90"
          onClick={onCancelPicking}
        >
          {t("cancel")}
        </Button>
      </div>
    )

    // ── Mobile: bottom sheet over a dimmed timeline ──
    if (!isDesktop) {
      return (
        <>
          {/* Keeps the item's slot (and the sortable node) in the list while
              the sheet is up, so the timeline doesn't jump on close. */}
          <div ref={setNodeRef} style={style} className="mb-3">
            <div className="h-14 rounded-xl border border-dashed border-accent/40 bg-accent/5" />
          </div>

          {createPortal(
            isPickingLocation ? (
              // The map needs the screen — swap the sheet for the pin prompt.
              <div className="fixed inset-x-0 bottom-6 z-[200] flex justify-center px-4 md:hidden">
                {pickingPrompt}
              </div>
            ) : (
              <div className="fixed inset-0 z-[200] md:hidden">
                <div
                  className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] animate-in fade-in duration-200"
                  onClick={handleCancel}
                />
                <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex shrink-0 justify-center pb-1 pt-2.5">
                    <span className="h-1 w-10 rounded-full bg-border" />
                  </div>
                  <div className="shrink-0">{formHeader}</div>
                  {/* min-h-0 is what lets this scroll instead of growing the
                      sheet past the viewport and pushing the actions off it. */}
                  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">{formFields}</div>
                  <div
                    className="shrink-0 border-t border-border/60 bg-card px-3 py-3"
                    style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
                  >
                    {formActions}
                  </div>
                </div>
              </div>
            ),
            document.body
          )}
        </>
      )
    }

    // ── Desktop: inline card in the timeline ──
    return (
      <div ref={setNodeRef} style={style} className="mb-3">
        <Card
          className={`relative gap-0 overflow-hidden rounded-2xl border-2 border-accent bg-card p-0 shadow-xl ${
            isNew ? "animate-pulse-highlight" : ""
          }`}
        >
          {formHeader}
          <div className="space-y-3 p-4">
            <div
              className={`space-y-3 transition-all duration-500 ${
                isPickingLocation ? "pointer-events-none scale-95 opacity-20 blur-sm" : "opacity-100"
              }`}
            >
              {formFields}
              {formActions}
            </div>
          </div>

          {isPickingLocation && (
            <div className="absolute inset-4 flex flex-col items-center justify-center gap-3 text-center animate-in fade-in zoom-in duration-300">
              {pickingPrompt}
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
        className="group relative"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
    >
      {/* Design doc Screen 03 card: [№ chip][pastel icon tile][title + date
          chip / location][¥ pill][pencil]. The № chip doubles as the drag
          handle for reordering within a day. */}
      <Card
        className={`
          w-full flex flex-row gap-2 md:gap-3 items-center bg-card border border-border/70 shadow-xs transition-all hover:shadow-md hover:border-primary/30
          ${isDragging ? 'opacity-50' : ''}
          ${isNew ? 'animate-pulse-highlight border-accent' : ''}
          ${isCompact ? 'p-2 rounded-lg' : 'p-2.5 md:p-3 rounded-xl'}
        `}
      >
        {/* № drag handle */}
        <div
          className="shrink-0 cursor-grab active:cursor-grabbing"
          title="Чирж эрэмбэлэх"
          {...attributes}
          {...listeners}
        >
          <span className={`flex items-center justify-center rounded-full bg-tint-saffron font-black text-saffron-600 transition-transform group-hover:scale-105 ${isCompact ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 md:h-7 md:w-7 text-[10px] md:text-xs'}`}>
            {index}
          </span>
        </div>

        {/* pastel icon tile */}
        <div className={`flex items-center justify-center rounded-xl shrink-0 ${viewIconData.tint ?? 'bg-muted/50'} ${isCompact ? 'h-8 w-8' : 'h-10 w-10 md:h-11 md:w-11'}`}>
          <viewIconData.icon className={`${isCompact ? 'h-4 w-4' : 'h-5 w-5'} ${viewIconData.color || 'text-primary'}`} />
        </div>

        {/* title + date chip / location */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h4 className={`font-bold truncate text-foreground ${isCompact ? 'text-xs' : 'text-sm md:text-[15px]'}`}>{title}</h4>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-secondary/60 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground md:text-[10px]">
              <Calendar className="h-2.5 w-2.5" />
              {formatMnShort(date)}
            </span>
            {/* Notes live inside the edit form; this marks the items that have
                one so they're findable without opening every card. Compact rows
                drop the location line, so the marker rides along the title. */}
            {notes && isCompact && <StickyNote className="h-3 w-3 shrink-0 text-accent" />}
          </div>
          {!isCompact && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground md:text-xs">
              {notes && <StickyNote className="h-3 w-3 shrink-0 text-accent" />}
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>

        {/* cost + edit */}
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          <Badge variant="outline" className={`font-mono font-semibold text-foreground border-border bg-card px-1.5 md:px-2.5 ${isCompact ? 'text-[9px] py-0 h-4 md:h-5' : 'text-[10px] md:text-xs'}`}>
            {formatCurrency(cost)}
          </Badge>
          <Button
            onClick={startEditing}
            variant="ghost"
            size="icon"
            className={`rounded-full shrink-0 text-muted-foreground transition-all hover:text-primary hover:bg-secondary ${isCompact ? 'h-7 w-7' : 'h-8 w-8 md:h-9 md:w-9'}`}
          >
            <Pencil className={isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </Button>
        </div>
      </Card>
    </div>
  )
}
