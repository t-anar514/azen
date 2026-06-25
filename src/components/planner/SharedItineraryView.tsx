"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
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
  Activity as ActivityIcon,
  List,
  Map as MapIcon,
} from "lucide-react"
import { ItemType, ActivityType } from "./Timeline"
import { InteractiveMap } from "./InteractiveMap"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SharedItineraryViewProps {
  title: string
  items: ItemType[]
  currency?: "MNT" | "USD" | "JPY"
}

// Mongolian weekday abbreviations, indexed to match Date#getUTCDay() (0 = Sunday).
const MN_WEEKDAYS_SHORT = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"]

// Manual, ICU-free date formatter. `toLocaleDateString("mn-MN", ...)` depends on the
// runtime having full Mongolian Intl locale data — Node servers commonly ship with only
// "small-icu" (English-only) data while browsers always have full ICU, so the server would
// silently render English ("Fri, Dec 19") while the client renders Mongolian
// ("12-р сарын 19, Ба"), causing a hydration mismatch. Formatting it by hand instead
// guarantees identical output on the server and the client. Dates are date-only
// (YYYY-MM-DD) strings, so UTC getters are used to avoid any timezone-related day shift.
function formatMnDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`)
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  const weekday = MN_WEEKDAYS_SHORT[d.getUTCDay()]
  return `${month}-р сарын ${day}, ${weekday}`
}

function getIcon(type: ActivityType) {
  const props = { className: "h-4 w-4" }
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
    case "activity": return <ActivityIcon {...props} />
    default: return <MapPin {...props} />
  }
}

export function SharedItineraryView({ title, items, currency = "JPY" }: SharedItineraryViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const total = useMemo(() => items.reduce((sum, i) => sum + (i.cost || 0), 0), [items])

  const formatCost = (val: number) => {
    switch (currency) {
      case "MNT": return `₮ ${(val * 22).toLocaleString("en-US")}`
      case "USD": return `$ ${(val / 150).toFixed(2)}`
      default: return `¥${val.toLocaleString("en-US")}`
    }
  }

  const grouped = useMemo(() => {
    const byDate = new Map<string, ItemType[]>()
    for (const item of items) {
      const list = byDate.get(item.date) ?? []
      list.push(item)
      byDate.set(item.date, list)
    }
    return Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [items])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
      <div className="flex flex-1 overflow-hidden">
        {/* Left: read-only timeline */}
        <div
          className={`${viewMode === "list" ? "flex" : "hidden"} md:flex w-full md:w-1/2 lg:w-5/12 h-full bg-muted/10 flex-col`}
        >
          <div className="p-4 md:p-6 space-y-1 border-b shrink-0">
            <Badge variant="secondary" className="mb-1">Зөвхөн харах горим</Badge>
            <h1 className="text-xl md:text-2xl font-black font-mono tracking-tight uppercase italic text-primary truncate">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Нийт зардал: <span className="font-bold text-primary">{formatCost(total)}</span>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
            {grouped.length === 0 && (
              <p className="text-sm text-muted-foreground">Энэ аялалд үйл ажиллагаа алга байна.</p>
            )}
            {grouped.map(([date, dayItems]) => (
              <div key={date} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {formatMnDate(date)}
                </p>
                <div className="space-y-2">
                  {dayItems.map((item) => (
                    <Card
                      key={item.id}
                      className={`p-3 flex items-start gap-3 transition-colors ${
                        hoveredId === item.id ? "border-accent" : ""
                      }`}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div className="rounded-full bg-accent/10 text-accent p-2 shrink-0">
                        {getIcon(item.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" /> {item.location}
                        </p>
                      </div>
                      {item.cost > 0 && (
                        <p className="text-xs font-mono font-bold text-primary shrink-0">
                          {formatCost(item.cost)}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t shrink-0">
            <Button asChild className="w-full">
              <Link href="/planner">Өөрийн аялал төлөвлөх</Link>
            </Button>
          </div>
        </div>

        {/* Right: read-only map */}
        <div
          className={`${viewMode === "map" ? "flex" : "hidden"} md:flex md:w-1/2 lg:w-7/12 flex-1 h-full bg-muted border-l`}
        >
          <InteractiveMap items={items} hoveredId={hoveredId} isPicking={false} />
        </div>
      </div>

      {/* Mobile view toggle */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
          className="rounded-full w-14 h-14 shadow-2xl bg-primary hover:bg-primary/90 text-white border-2 border-white/20"
          size="icon"
        >
          {viewMode === "list" ? <MapIcon className="h-6 w-6" /> : <List className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  )
}
