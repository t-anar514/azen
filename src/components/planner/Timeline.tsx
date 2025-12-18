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

export function Timeline({ onCostChange }: { onCostChange: (cost: number) => void }) {
  const [items, setItems] = useState<ItemType[]>(INITIAL_ITEMS)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const calculateTotal = (updatedItems: ItemType[]) => {
    onCostChange(updatedItems.reduce((sum, item) => sum + item.cost, 0))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const updatedItems = arrayMove(items, oldIndex, newIndex)
        return updatedItems
      })
    }
  }

  const addItem = () => {
    const newItem: ItemType = {
        id: `item-${Date.now()}`,
        title: "New Activity",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "spot",
        location: "Select Location",
        cost: 0
    }
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    calculateTotal(updatedItems)
  }

  const updateItem = (id: string, updates: Partial<ItemType>) => {
    const updatedItems = items.map(item => item.id === id ? { ...item, ...updates } : item)
    setItems(updatedItems)
    calculateTotal(updatedItems)
  }

  const deleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id)
    setItems(updatedItems)
    calculateTotal(updatedItems)
  }

  return (
    <div className="p-4 md:p-6 pb-24">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black font-mono tracking-tight uppercase italic text-primary">Day 1: Tokyo Arrival</h2>
            <Button 
                onClick={addItem} 
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
                onUpdate={(updates) => updateItem(item.id, updates)}
                onDelete={() => deleteItem(item.id)}
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
