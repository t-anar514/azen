"use client"

import { useState, useCallback, useEffect } from "react"
import { Timeline, ItemType } from "@/components/planner/Timeline"
import { InteractiveMap } from "@/components/planner/InteractiveMap"
import { CostFooter } from "@/components/planner/CostFooter"
import { arrayMove } from "@dnd-kit/sortable"

const INITIAL_ITEMS: ItemType[] = [
  { id: "1", title: "Arrival at Narita", time: "10:00 AM", type: "flight", location: "Narita Airport", cost: 0 },
  { id: "2", title: "Check-in at Ryokan", time: "02:00 PM", type: "hotel", location: "Asakusa View Hotel", cost: 25000 },
  { id: "3", title: "Visit Senso-ji", time: "04:00 PM", type: "spot", location: "Asakusa Temple", cost: 0 },
]

export default function PlannerPage() {
  const [items, setItems] = useState<ItemType[]>(INITIAL_ITEMS)
  const [totalCost, setTotalCost] = useState(25000)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const calculateTotal = useCallback((updatedItems: ItemType[]) => {
    setTotalCost(updatedItems.reduce((sum, item) => sum + item.cost, 0))
  }, [])

  const handleUpdateItems = useCallback((newItems: ItemType[]) => {
      setItems(newItems)
      calculateTotal(newItems)
  }, [calculateTotal])

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
    handleUpdateItems(updatedItems)
  }

  const updateItem = (id: string, updates: Partial<ItemType>) => {
    const updatedItems = items.map(item => item.id === id ? { ...item, ...updates } : item)
    handleUpdateItems(updatedItems)
  }

  const deleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id)
    handleUpdateItems(updatedItems)
  }

  const moveItem = (activeId: string, overId: string) => {
    const oldIndex = items.findIndex((item) => item.id === activeId)
    const newIndex = items.findIndex((item) => item.id === overId)
    const updatedItems = arrayMove(items, oldIndex, newIndex)
    setItems(updatedItems)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
            {/* Left: Timeline (Scrollable) */}
            <div className="w-full md:w-1/2 lg:w-5/12 overflow-y-auto bg-muted/10 h-full scrollbar-hide">
                <Timeline 
                    items={items}
                    onAdd={addItem}
                    onUpdate={updateItem}
                    onDelete={deleteItem}
                    onMove={moveItem}
                    onHover={setHoveredId}
                />
            </div>

            {/* Right: Map (Sticky/Fixed on Desktop, Hidden on Mobile) */}
            <div className="hidden md:block md:w-1/2 lg:w-7/12 h-full bg-muted border-l">
                <InteractiveMap items={items} hoveredId={hoveredId} />
            </div>
        </div>
        
        <CostFooter total={totalCost} />
    </div>
  )
}
