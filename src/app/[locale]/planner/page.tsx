"use client"

import { useState, useCallback, useEffect } from "react"
import { Timeline, ItemType } from "@/components/planner/Timeline"
import { InteractiveMap } from "@/components/planner/InteractiveMap"
import { CostFooter } from "@/components/planner/CostFooter"
import { arrayMove } from "@dnd-kit/sortable"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { SAMPLE_ITINERARIES } from "@/data/templates"

export default function PlannerPage() {
  const t = useTranslations("Planner")
  
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')

  const [items, setItems] = useState<ItemType[]>([])
  const [itineraryTitle, setItineraryTitle] = useState("")
  const [totalCost, setTotalCost] = useState(25000)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [pickingLocationId, setPickingLocationId] = useState<string | null>(null)
  const [newItemId, setNewItemId] = useState<string | null>(null)
  const [isManualAdd, setIsManualAdd] = useState(false)

  const calculateTotal = useCallback((updatedItems: ItemType[]) => {
    setTotalCost(updatedItems.reduce((sum, item) => sum + item.cost, 0))
  }, [])

  // Load ITINERARY DATA
  useEffect(() => {
    // 1. Check for Template Injected via URL
    if (templateId) {
      const template = SAMPLE_ITINERARIES.find(t => t.id === templateId)
      if (template) {
        setItems(template.activities)
        setItineraryTitle(t(`item.templates.${templateId}.title`, { fallback: templateId }))
        calculateTotal(template.activities)
        // Trigger auto-scroll to the first item
        if (template.activities.length > 0) {
            setNewItemId(template.activities[0].id)
        }
        return
      }
    }

    // 2. Load from localStorage if no template
    const savedItems = localStorage.getItem("azen_itinerary_items")
    const savedTitle = localStorage.getItem("azen_itinerary_title")
    
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems)
        setItems(parsedItems)
        calculateTotal(parsedItems)
        if (savedTitle) setItineraryTitle(savedTitle)
        return
      } catch (e) {
        console.error("Failed to parse saved items", e)
      }
    }

    // 3. Fallback to Default initialization
    setItineraryTitle(t("defaultTitle"))
    const initialItems: ItemType[] = [
      { id: "1", title: t("item.initialItems.arrival"), date: "2025-12-19", type: "flight", location: t("item.initialItemsLocations.arrival"), cost: 0, lat: 35.7720, lng: 140.3929 },
      { id: "2", title: t("item.initialItems.checkIn"), date: "2025-12-19", type: "hotel", location: t("item.initialItemsLocations.checkIn"), cost: 25000, lat: 35.7145, lng: 139.7925 },
      { id: "3", title: t("item.initialItems.sensoji"), date: "2025-12-19", type: "spot", location: t("item.initialItemsLocations.sensoji"), cost: 0, lat: 35.7148, lng: 139.7967 },
    ]
    setItems(initialItems)
  }, [t, templateId, calculateTotal])

  const saveItinerary = () => {
    localStorage.setItem("azen_itinerary_items", JSON.stringify(items))
    localStorage.setItem("azen_itinerary_title", itineraryTitle)
    console.log(t("saved"))
  }

  // Clear newItemId after highlight
  useEffect(() => {
    if (newItemId) {
      const timer = setTimeout(() => setNewItemId(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [newItemId])

  const handleUpdateItems = useCallback((newItems: ItemType[]) => {
      // Sort primarily by date, but keep relative order for items with the same date
      const sortedItems = [...newItems].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return 0 // Keep original relative order if dates are same
      })

      setItems(sortedItems)
      calculateTotal(sortedItems)
  }, [calculateTotal])

  const addItem = () => {
    const id = `item-${Date.now()}`
    const newItem: ItemType = {
        id,
        title: t("newActivity"),
        date: new Date().toISOString().split('T')[0],
        type: "spot",
        location: t("selectLocation"),
        cost: 0
    }
    const updatedItems = [...items, newItem]
    handleUpdateItems(updatedItems)
    setIsManualAdd(true)
    setNewItemId(id)
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
    const activeItem = items.find(i => i.id === activeId)
    const overItem = items.find(i => i.id === overId)

    if (activeItem && overItem && activeItem.date === overItem.date) {
      const oldIndex = items.findIndex((item) => item.id === activeId)
      const newIndex = items.findIndex((item) => item.id === overId)
      const updatedItems = arrayMove(items, oldIndex, newIndex)
      setItems(updatedItems)
    }
  }

  const handleMapClick = (lat: number, lng: number, locationName?: string) => {
      if (pickingLocationId) {
          updateItem(pickingLocationId, { 
              lat, 
              lng, 
              location: locationName || t("selectedLocation") 
          })
          setPickingLocationId(null)
      }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
            {/* Left: Timeline (Scrollable) */}
            <div className="w-full md:w-1/2 lg:w-5/12 overflow-y-auto bg-muted/10 h-full scrollbar-hide">
                <Timeline 
                    title={itineraryTitle}
                    onTitleChange={setItineraryTitle}
                    items={items}
                    onAdd={addItem}
                    onUpdate={updateItem}
                    onDelete={deleteItem}
                    onMove={moveItem}
                    onHover={setHoveredId}
                    pickingLocationId={pickingLocationId}
                    onStartPicking={setPickingLocationId}
                    newItemId={newItemId}
                    isManualAdd={isManualAdd}
                />
            </div>

            {/* Right: Map (Sticky/Fixed on Desktop, Hidden on Mobile) */}
            <div className={`hidden md:block md:w-1/2 lg:w-7/12 h-full bg-muted border-l transition-all ${pickingLocationId ? 'ring-4 ring-accent ring-inset' : ''}`}>
                <InteractiveMap 
                    items={items} 
                    hoveredId={hoveredId} 
                    onMapClick={handleMapClick}
                    isPicking={!!pickingLocationId}
                />
            </div>
        </div>
        
        <CostFooter total={totalCost} onSave={saveItinerary} />
    </div>
  )
}
