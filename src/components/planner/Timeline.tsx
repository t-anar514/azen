"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { TimelineItem } from "./TimelineItem"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { Cloud, CloudOff, RefreshCw, AlertCircle, Plus, Pencil, Check, X } from "lucide-react"

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error'
// Type definition matching TimelineItem props
export type ActivityType = 
    "flight" | "spot" | "food" | "hotel" | "shopping" | "transport" | 
    "sightseeing" | "nature" | "culture" | "nightlife" | "activity" |
    "photo" | "landmark" | "castle" | "special" | "city" |
    "meal" | "cafe" | "pizza" | "wine" | "beer" | "dessert" |
    "train" | "car" | "bus" | "tram" | "bike" |
    "house" | "camp" | "sleep" |
    "market" | "gift" | "sale" |
    "music" | "love" | "star" | "ticket";

export type ItemType = {
  id: string
  title: string
  date: string // ISO date string YYYY-MM-DD
  type: ActivityType
  location: string
  cost: number
  lat?: number
  lng?: number
  sortOrder?: number
}

interface TimelineProps {
  title: string
  onTitleChange: (newTitle: string) => void
  items: ItemType[]
  onAdd: () => void
  onUpdate: (id: string, updates: Partial<ItemType>) => void
  onDelete: (id: string) => void
  onMove: (activeId: string, overId: string) => void
  onHover: (id: string | null) => void
  pickingLocationId: string | null
  onStartPicking: (id: string | null) => void
  newItemId?: string | null
  isManualAdd?: boolean
  isCompact?: boolean
  onToggleCompact?: () => void
  syncStatus?: SyncStatus
  currency?: "MNT" | "USD" | "JPY"
}

export function Timeline({ 
    title,
    onTitleChange,
    items, 
    onAdd, 
    onUpdate, 
    onDelete, 
    onMove,
    onHover,
    pickingLocationId,
    onStartPicking,
    newItemId,
    isManualAdd,
    isCompact,
    onToggleCompact,
    syncStatus,
    currency = "JPY"
}: TimelineProps) {
  const t = useTranslations("Planner")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(title)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
        onMove(active.id as string, over.id as string)
    }
  }

  const handleTitleSubmit = () => {
    onTitleChange(tempTitle)
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setTempTitle(title)
    setIsEditingTitle(false)
  }

  return (
    <div className="p-4 md:p-6 pb-24">
        <div className="flex justify-between items-center mb-6 gap-4">
            <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                        <Input 
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleSubmit()
                                if (e.key === 'Escape') handleTitleCancel()
                            }}
                            className="text-2xl font-black font-mono tracking-tight uppercase italic text-primary h-auto py-1 px-2 border-accent"
                            autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-accent shrink-0" onClick={handleTitleSubmit}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground shrink-0" onClick={handleTitleCancel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                        <h2 className="text-2xl font-black font-mono tracking-tight uppercase italic text-primary">{title}</h2>
                        <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        
                        {/* Sync Status Indicator */}
                        <div className="flex items-center gap-1.5 ml-1">
                            {syncStatus === 'syncing' && <RefreshCw className="h-4 w-4 text-accent animate-spin" />}
                            {syncStatus === 'saved' && <div title="Synchronized"><Cloud className="h-4 w-4 text-[#88a47c]" /></div>}
                            {syncStatus === 'error' && <div title="Sync Failed"><AlertCircle className="h-4 w-4 text-destructive" /></div>}
                            {syncStatus === 'idle' && <div title="Offline Mode"><CloudOff className="h-4 w-4 text-muted-foreground/30" /></div>}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex shrink-0 gap-2">
                <Button 
                    onClick={onToggleCompact} 
                    variant="outline"
                    size="sm" 
                    className={`rounded-full px-4 border-2 ${isCompact ? 'bg-accent/10 border-accent text-accent' : 'border-muted-foreground/20'}`}
                    title={isCompact ? "Normal View" : "Compact View"}
                >
                    {isCompact ? "Энгийн" : "Шахах"}
                </Button>
                <Button 
                    onClick={onAdd} 
                    size="sm" 
                    className="bg-accent hover:bg-accent/90 text-white rounded-full px-4"
                >
                    <Plus className="h-4 w-4 mr-2" /> {t("addActivity")}
                </Button>
            </div>
        </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {items.map((item, index) => (
              <TimelineItem 
                key={item.id} 
                {...item} 
                index={index + 1}
                onUpdate={(updates) => onUpdate(item.id, updates)}
                onDelete={() => onDelete(item.id)}
                onHover={() => onHover(item.id)}
                onLeave={() => onHover(null)}
                isPickingLocation={pickingLocationId === item.id}
                onStartPicking={() => onStartPicking(item.id)}
                onCancelPicking={() => onStartPicking(null)}
                isNew={item.id === newItemId}
                autoEdit={item.id === newItemId && !!isManualAdd}
                isCompact={isCompact}
                currency={currency}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
