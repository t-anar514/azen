"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import { Timeline, ItemType } from "@/components/planner/Timeline"
import { InteractiveMap } from "@/components/planner/InteractiveMap"
import { CostFooter } from "@/components/planner/CostFooter"
import { TripSettings } from "@/components/planner/SettingsModal"
import { arrayMove } from "@dnd-kit/sortable"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { SAMPLE_ITINERARIES } from "@/data/templates"
import { supabase } from "@/lib/supabase"

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error'

function PlannerContent() {
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
  const [isCompact, setIsCompact] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [tripId, setTripId] = useState<string | null>(searchParams.get('trip'))

  const [settings, setSettings] = useState<TripSettings>({
    simplifyExpenses: false,
    defaultCurrency: "JPY",
    startDate: "2024-01-01", // Placeholder that will be updated on mount
    endDate: "2024-01-08"
  })

  // Initialize dates on client-side only
  useEffect(() => {
    // Only update if it's the placeholder
    if (settings.startDate === "2024-01-01") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings(prev => ({
        ...prev,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }))
    }
  }, [settings.startDate])

  const calculateTotal = useCallback((updatedItems: ItemType[]) => {
    setTotalCost(updatedItems.reduce((sum, item) => sum + item.cost, 0))
  }, [])

  // Load ITINERARY DATA
  useEffect(() => {
    // 1. Check for Template Injected via URL
    if (templateId) {
      const template = SAMPLE_ITINERARIES.find(t => t.id === templateId)
      if (template) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(template.activities)
        setItineraryTitle(t(`item.templates.${templateId}.title`, { fallback: templateId }))
        calculateTotal(template.activities)
        
        // Update dates based on template if possible (mocking 14 days for golden route etc)
        const start = new Date().toISOString().split('T')[0]
        const end = new Date(Date.now() + (template.duration || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        setSettings(prev => ({ ...prev, startDate: start, endDate: end }))

        if (template.activities.length > 0) {
            setNewItemId(template.activities[0].id)
        }
        return
      }
    }

    // 2. Load from localStorage if no template
    const savedItems = localStorage.getItem("azen_itinerary_items")
    const savedTitle = localStorage.getItem("azen_itinerary_title")
    const savedSettings = localStorage.getItem("azen_itinerary_settings")
    
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems)
        setItems(parsedItems)
        calculateTotal(parsedItems)
        if (savedTitle) setItineraryTitle(savedTitle)
        if (savedSettings) setSettings(JSON.parse(savedSettings))
        return
      } catch (e) {
        console.error("Failed to parse saved data", e)
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

  // CLOUD FETCH
  useEffect(() => {
    async function loadFromCloud() {
      if (!tripId) return
      
      setSyncStatus('syncing')
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', tripId)
        .single()

      if (error) {
        console.error("Cloud fetch failed:", error)
        setSyncStatus('error')
        return
      }

      if (data) {
        setItems(data.items)
        setItineraryTitle(data.title)
        if (data.settings) setSettings(data.settings)
        calculateTotal(data.items)
        setSyncStatus('saved')
      }
    }

    loadFromCloud()
  }, [tripId, calculateTotal])

  // CLOUD SYNC (Debounced)
  useEffect(() => {
    // skip initial load or if no tripod/items
    if (!items.length) return

    const timer = setTimeout(async () => {
      setSyncStatus('syncing')
      
      const payload = {
        title: itineraryTitle,
        items: items,
        settings: settings,
        updated_at: new Date().toISOString()
      }

      if (tripId) {
        const { error } = await supabase
          .from('itineraries')
          .update(payload)
          .eq('id', tripId)
        
        if (error) {
          console.error("Cloud sync update failed:", error)
          setSyncStatus('error')
        } else {
          setSyncStatus('saved')
        }
      } else {
        // Create new trip on first major change if not from template
        const { data, error } = await supabase
          .from('itineraries')
          .insert([payload])
          .select()
        
        if (error) {
          console.error("Cloud sync insert failed:", error)
          setSyncStatus('error')
        } else if (data?.[0]) {
          setTripId(data[0].id)
          // Update URL without reload? For now just internal state
          window.history.replaceState(null, '', `?trip=${data[0].id}`)
          setSyncStatus('saved')
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [items, itineraryTitle, settings, tripId])

  const saveItinerary = () => {
    localStorage.setItem("azen_itinerary_items", JSON.stringify(items))
    localStorage.setItem("azen_itinerary_title", itineraryTitle)
    localStorage.setItem("azen_itinerary_settings", JSON.stringify(settings))
    console.log(t("saved"))
  }

  const handleSettingsUpdate = (newSettings: TripSettings) => {
    // Date Range Logic
    if (newSettings.startDate !== settings.startDate || newSettings.endDate !== settings.endDate) {
      const activitiesOutside = items.filter(item => 
        item.date < newSettings.startDate || item.date > newSettings.endDate
      )

      if (activitiesOutside.length > 0) {
        const confirmMsg = t("dateWarning") || "Changing dates will remove some activities. Continue?"
        if (!window.confirm(confirmMsg)) return
        
        const filteredItems = items.filter(item => 
          item.date >= newSettings.startDate && item.date <= newSettings.endDate
        )
        setItems(filteredItems)
        calculateTotal(filteredItems)
      }
    }
    setSettings(newSettings)
  }

  const handleExport = () => {
    const headers = ["ID", "Title", "Date", "Type", "Location", "Cost (JPY)"]
    const rows = items.map(i => [
      i.id,
      i.title,
      i.date,
      i.type,
      i.location,
      i.cost.toString()
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${itineraryTitle || 'trip'}_expenses.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
                    isCompact={isCompact}
                    onToggleCompact={() => setIsCompact(!isCompact)}
                    syncStatus={syncStatus}
                    currency={settings.defaultCurrency}
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
        
        <CostFooter 
          total={totalCost} 
          onSave={saveItinerary} 
          settings={settings}
          onSettingsUpdate={handleSettingsUpdate}
          onExport={handleExport}
        />
    </div>
  )
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-background">Loading Planner...</div>}>
      <PlannerContent />
    </Suspense>
  )
}
