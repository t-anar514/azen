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
type ItemType = {
  id: string
  title: string
  time: string
  type: "flight" | "spot" | "food" | "hotel"
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addItem = () => {
    const newItem: ItemType = {
        id: `item-${Date.now()}`,
        title: "New Activity",
        time: "TBD",
        type: "spot",
        location: "Select Location",
        cost: 3000
    }
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    onCostChange(updatedItems.reduce((sum, item) => sum + item.cost, 0))
  }

  return (
    <div className="p-4 md:p-6 pb-24">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-mono">Day 1: Tokyo Arrival</h2>
            <Button onClick={addItem} size="sm" variant="outline">
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
          {items.map((item) => (
            <TimelineItem key={item.id} {...item} />
          ))}
        </SortableContext>
      </DndContext>
      
      {/* Zen Buffer Alert */}
      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg flex gap-3 text-sm text-amber-900 dark:text-amber-100">
          <span className="text-xl">⚠️</span>
          <div>
              <p className="font-bold">Azen Crowd Alert</p>
              <p>Senso-ji gets crowded after 10 AM. We added a 30m buffer for transit.</p>
          </div>
      </div>
    </div>
  )
}
