"use client"

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
import { Plus } from "lucide-react"

// Type definition matching TimelineItem props
export type ActivityType = "flight" | "spot" | "food" | "hotel" | "shopping" | "transport";

export type ItemType = {
  id: string
  title: string
  time: string
  type: ActivityType
  location: string
  cost: number
}

const INITIAL_ITEMS: ItemType[] = [
  { id: "1", title: "Arrival at Narita", time: "10:00 AM", type: "flight", location: "Narita Airport", cost: 0 },
  { id: "2", title: "Check-in at Ryokan", time: "02:00 PM", type: "hotel", location: "Asakusa View Hotel", cost: 25000 },
  { id: "3", title: "Visit Senso-ji", time: "04:00 PM", type: "spot", location: "Asakusa Temple", cost: 0 },
]

interface TimelineProps {
  items: ItemType[]
  onAdd: () => void
  onUpdate: (id: string, updates: Partial<ItemType>) => void
  onDelete: (id: string) => void
  onMove: (activeId: string, overId: string) => void
  onHover: (id: string | null) => void
}

export function Timeline({ 
    items, 
    onAdd, 
    onUpdate, 
    onDelete, 
    onMove,
    onHover 
}: TimelineProps) {
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

  return (
    <div className="p-4 md:p-6 pb-24">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black font-mono tracking-tight uppercase italic text-primary">Day 1: Tokyo Arrival</h2>
            <Button 
                onClick={onAdd} 
                size="sm" 
                className="bg-accent hover:bg-accent/90 text-white rounded-full px-4"
            >
                <Plus className="h-4 w-4 mr-2" /> Add Activity
            </Button>
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
            {items.map((item) => (
              <TimelineItem 
                key={item.id} 
                {...item} 
                onUpdate={(updates) => onUpdate(item.id, updates)}
                onDelete={() => onDelete(item.id)}
                onHover={() => onHover(item.id)}
                onLeave={() => onHover(null)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Zen Buffer Alert */}
      <div className="mt-8 p-6 bg-[#88a47c]/10 border-2 border-dashed border-[#88a47c]/30 rounded-2xl flex gap-4 text-sm text-[#1c315e]">
          <div className="p-2 bg-[#88a47c] rounded-lg text-white shrink-0">
             <Plus className="rotate-45 h-5 w-5" />
          </div>
          <div>
              <p className="font-black uppercase tracking-widest text-xs mb-1">Azen Zen Buffer</p>
              <p className="font-medium text-lg leading-snug">Senso-ji gets crowded after 10 AM. We added a 30m buffer for transit.</p>
          </div>
      </div>
    </div>
  )
}
