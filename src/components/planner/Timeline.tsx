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
    <div className="w-full max-w-2xl md:max-w-none mx-auto md:mx-0 p-3 md:p-6 pb-24 flex flex-col items-center md:items-start">
        <div className="flex flex-col gap-4 mb-8 w-full items-center md:items-start text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start w-full">
                {isEditingTitle ? (
                    <div className="flex items-center gap-2 w-full justify-center md:justify-start">
                        <Input 
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleSubmit()
                                if (e.key === 'Escape') handleTitleCancel()
                            }}
                            className="text-lg md:text-2xl font-black font-mono tracking-tight uppercase italic text-primary h-auto py-1 px-2 border-accent max-w-[250px] md:max-w-md"
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
                    <div className="flex items-center gap-2 group cursor-pointer justify-center md:justify-start min-w-0" onClick={() => setIsEditingTitle(true)}>
                        <h2 className="text-xl md:text-3xl font-black font-mono tracking-tight uppercase italic text-primary leading-tight truncate">{title}</h2>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        
                        {/* Sync Status Indicator */}
                        <div className="flex items-center gap-1.5 ml-1 shrink-0">
                            {syncStatus === 'syncing' && <RefreshCw className="h-4 w-4 text-accent animate-spin" />}
                            {syncStatus === 'saved' && <div title="Synchronized"><Cloud className="h-4 w-4 text-[#88a47c]" /></div>}
                            {syncStatus === 'error' && <div title="Sync Failed"><AlertCircle className="h-4 w-4 text-destructive" /></div>}
                            {syncStatus === 'idle' && <div title="Offline Mode"><CloudOff className="h-4 w-4 text-muted-foreground/30" /></div>}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 w-full max-w-[400px] md:max-w-none">
                <Button 
                    onClick={onToggleCompact} 
                    variant="outline"
                    size="lg" 
                    className={`flex-1 md:flex-none rounded-full px-6 border-2 h-11 ${isCompact ? 'bg-accent/10 border-accent text-accent' : 'border-muted-foreground/20'}`}
                    title={isCompact ? "Normal View" : "Compact View"}
                >
                    <span className="text-sm font-bold">{isCompact ? "Энгийн" : "Шахах"}</span>
                </Button>
                <Button 
                    onClick={onAdd} 
                    size="lg" 
                    className="flex-[2] md:flex-none bg-accent hover:bg-accent/90 text-white rounded-full px-8 h-11"
                >
                    <Plus className="h-5 w-5 mr-1" /> <span className="text-sm font-bold truncate">{t("addActivity")}</span>
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
          <div className="w-full space-y-1">
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
