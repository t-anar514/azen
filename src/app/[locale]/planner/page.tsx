"use client"

import { useState, useCallback, useEffect, useRef, Suspense } from "react"
import { Timeline, ItemType } from "@/components/planner/Timeline"
import { PlannerHeader } from "@/components/planner/PlannerHeader"
import { InteractiveMap } from "@/components/planner/InteractiveMap"
import { CostFooter } from "@/components/planner/CostFooter"
import { SharedItineraryView } from "@/components/planner/SharedItineraryView"
import { TripSettings } from "@/components/planner/SettingsModal"
import { arrayMove } from "@dnd-kit/sortable"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { SAMPLE_ITINERARIES } from "@/data/templates"
import { createClient } from "@/lib/supabase/client"
import { useExchangeRates } from "@/hooks/useExchangeRates"
import { usePlannerRealtime, ItineraryRow } from "@/hooks/usePlannerRealtime"
import { useClaimLocalTrip } from "@/hooks/useClaimLocalTrip"
import type { TripParticipant, CostSplit } from "@/lib/budget/splitBalances"

// Avatar chip colors for budget-split participants, assigned round-robin on
// creation (stored on the row so everyone sees the same color).
const PARTICIPANT_COLORS = ["#0ea5e9", "#f97316", "#10b981", "#8b5cf6", "#ef4444", "#eab308"]

// The current user's relationship to the loaded trip. null = still resolving
// (treated as read-only for cloud trips until known). Local-only trips
// (no tripId) are always editable by whoever is holding them.
export type TripRole = "owner" | "editor" | "viewer" | null

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error'

function PlannerContent() {
  const t = useTranslations("Planner")
  const [supabase] = useState(() => createClient())
  const [userId, setUserId] = useState<string | null>(null)
  const { rates, fetchedAt: ratesFetchedAt } = useExchangeRates()

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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list') // Mobile toggle
  const [role, setRole] = useState<TripRole>(null)

  // Post-login bridge for a guest-built localStorage trip (Phase 3): decides
  // whether the debounced cloud save below may create a cloud copy of it.
  const claimDecision = useClaimLocalTrip(userId, tripId)

  // Budget splitting (Phase 2) — cloud trips only, since participants and
  // splits live in their own tables keyed by trip_id. Both stay empty when
  // the trip is local-only or migration 0009 isn't applied yet.
  const [participants, setParticipants] = useState<TripParticipant[]>([])
  const [splits, setSplits] = useState<Map<string, CostSplit>>(new Map())
  // Presence: user ids currently on this trip's realtime channel, for the
  // online dots on the header avatars.
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([])

  // True while the debounced local save is still pending — remote realtime
  // changes are skipped during this window so they can't clobber what the
  // user is actively typing (last-write-wins is fine; mid-edit clobber isn't).
  const saveTimerPendingRef = useRef(false)
  // Set when state was just replaced by a remote realtime payload, so the
  // debounced-save effect skips one round instead of echoing it back.
  const applyingRemoteRef = useRef(false)

  // Auto-set compact on mobile. Post-mount on purpose (same as the other
  // window-dependent initializers below): reading window during render would
  // desync the SSR markup and trip hydration.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCompact(true)
    }
  }, [])

  // Track auth state — cloud save/sync and sharing require being logged in.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [supabase])

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

        // Resolve this user's role on the trip (drives edit vs read-only UI
        // and whether the debounced save is allowed to run).
        const { data: { user } } = await supabase.auth.getUser()
        if (user && data.owner_id === user.id) {
          setRole('owner')
        } else if (user) {
          const { data: collab } = await supabase
            .from('trip_collaborators')
            .select('role')
            .eq('trip_id', tripId)
            .eq('user_id', user.id)
            .eq('status', 'accepted')
            .maybeSingle()
          // No accepted collaborator row (or table not migrated yet) means the
          // trip was reachable only because it's public → read-only.
          setRole(collab?.role === 'editor' ? 'editor' : 'viewer')
        } else {
          setRole('viewer')
        }
      }
    }

    loadFromCloud()
  }, [tripId, calculateTotal, supabase])

  // CLOUD SYNC (Debounced) — only for logged-in users; guests stay on localStorage only.
  useEffect(() => {
    // A remote realtime payload just replaced local state — consume the flag
    // and skip one round so we don't echo the same row straight back.
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false
      return
    }
    // skip initial load or if no items, or not logged in
    if (!items.length || !userId) return
    // Cloud trips are only writable by the owner or an accepted editor; while
    // the role is still resolving (null) hold off rather than risk an
    // RLS-rejected write flashing a sync error at a viewer.
    if (tripId && role !== 'owner' && role !== 'editor') return
    // Don't create a cloud copy of a guest-built local trip until the user
    // has answered the claim prompt (and never if they declined).
    if (!tripId && (claimDecision === 'checking' || claimDecision === 'declined')) return

    saveTimerPendingRef.current = true
    const timer = setTimeout(async () => {
      saveTimerPendingRef.current = false
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
        // Create new trip on first major change if not from template.
        // The id is generated client-side instead of read back via
        // .insert().select() — INSERT ... RETURNING needs the SELECT policy
        // to pass on the brand-new row, which is snapshot-sensitive (see
        // migration 0010); a plain INSERT only needs the insert policy.
        const newTripId = crypto.randomUUID()
        const { error } = await supabase
          .from('itineraries')
          .insert([{ ...payload, id: newTripId, owner_id: userId }])

        if (error) {
          console.error("Cloud sync insert failed:", error)
          setSyncStatus('error')
        } else {
          setTripId(newTripId)
          setRole('owner') // we just created it
          // The trip now lives in the account — clear the guest-era local
          // copy so it can't come back as a duplicate on the next visit.
          if (claimDecision === 'approved') {
            localStorage.removeItem("azen_itinerary_items")
            localStorage.removeItem("azen_itinerary_title")
            localStorage.removeItem("azen_itinerary_settings")
          }
          // Update URL without reload? For now just internal state
          window.history.replaceState(null, '', `?trip=${newTripId}`)
          setSyncStatus('saved')
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [items, itineraryTitle, settings, tripId, userId, role, claimDecision, supabase])

  // LIVE SYNC — apply other editors' saves within ~1s (last-write-wins at the
  // row level; per-item merging is deliberately deferred v2 scope).
  const handleRemoteChange = useCallback((row: ItineraryRow) => {
    // Don't clobber what the user is actively typing; their own save will win
    // and propagate back out to everyone else.
    if (saveTimerPendingRef.current) return
    applyingRemoteRef.current = true
    const remoteItems = row.items ?? []
    setItems(remoteItems)
    setItineraryTitle(row.title)
    if (row.settings) setSettings(row.settings)
    calculateTotal(remoteItems)
  }, [calculateTotal])

  // BUDGET SPLIT DATA — roster + per-item cost assignments for cloud trips.
  // Extracted as a callback because it doubles as the realtime refetch: any
  // participants/splits event on the trip (another editor adding someone, an
  // invite being accepted, a split reassigned) re-runs this.
  const loadBudgetData = useCallback(async () => {
    if (!tripId) return
    const { data: parts, error: partsError } = await supabase
      .from('trip_participants')
      .select('id, display_name, color, user_id')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true })
    // Table missing (migration 0009 not applied) or unreadable → leave the
    // splitting UI hidden rather than surfacing a broken form.
    if (partsError || !parts) return
    setParticipants(parts.map((p) => ({
      id: p.id,
      displayName: p.display_name,
      color: p.color ?? undefined,
      userId: p.user_id ?? null,
    })))

    const { data: splitRows } = await supabase
      .from('item_cost_splits')
      .select('item_id, paid_by, split_between')
      .eq('trip_id', tripId)
    if (splitRows) {
      setSplits(new Map(splitRows.map((s) => [
        s.item_id,
        { itemId: s.item_id, paidBy: s.paid_by, splitBetween: s.split_between ?? [] },
      ])))
    }
  }, [tripId, supabase])

  useEffect(() => {
    if (!tripId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParticipants([])
      setSplits(new Map())
      return
    }
    loadBudgetData()
  }, [tripId, loadBudgetData])

  // LIVE SYNC channel: itinerary row updates, budget-table changes, and
  // presence (who's on the trip right now).
  usePlannerRealtime(tripId, handleRemoteChange, {
    onBudgetChange: loadBudgetData,
    presenceUserId: userId,
    onPresenceSync: setOnlineUserIds,
  })

  const addParticipant = async (name: string) => {
    if (!tripId || !name.trim()) return
    const color = PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length]
    const { data, error } = await supabase
      .from('trip_participants')
      .insert({ trip_id: tripId, display_name: name.trim(), color })
      .select('id, display_name, color')
      .single()
    if (!error && data) {
      setParticipants((prev) => [...prev, { id: data.id, displayName: data.display_name, color: data.color ?? undefined }])
    }
  }

  const removeParticipant = async (participantId: string) => {
    if (!tripId) return
    const { error } = await supabase
      .from('trip_participants')
      .delete()
      .eq('id', participantId)
    if (error) return
    setParticipants((prev) => prev.filter((p) => p.id !== participantId))
    // Best-effort cleanup: drop the deleted person from any split arrays so
    // stale ids don't linger (paid_by nulls out via FK, arrays can't).
    const affected = Array.from(splits.values()).filter((s) => s.splitBetween.includes(participantId))
    for (const s of affected) {
      const nextBetween = s.splitBetween.filter((id) => id !== participantId)
      await supabase
        .from('item_cost_splits')
        .update({ split_between: nextBetween })
        .eq('trip_id', tripId)
        .eq('item_id', s.itemId)
    }
    if (affected.length > 0) {
      setSplits((prev) => {
        const next = new Map(prev)
        for (const s of affected) {
          const existing = next.get(s.itemId)
          if (existing) {
            next.set(s.itemId, { ...existing, splitBetween: existing.splitBetween.filter((id) => id !== participantId) })
          }
        }
        return next
      })
    }
  }

  const updateSplit = async (itemId: string, paidBy: string | null, splitBetween: string[]) => {
    if (!tripId) return
    const { error } = await supabase
      .from('item_cost_splits')
      .upsert(
        { trip_id: tripId, item_id: itemId, paid_by: paidBy, split_between: splitBetween },
        { onConflict: 'trip_id,item_id' }
      )
    if (!error) {
      setSplits((prev) => new Map(prev).set(itemId, { itemId, paidBy, splitBetween }))
    }
  }

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
    const headers = ["ID", "Title", "Date", "Type", "Location", "Cost (JPY)", "Notes"]
    const rows = items.map(i => [
      i.id,
      i.title,
      i.date,
      i.type,
      i.location,
      i.cost.toString(),
      i.notes ?? ""
    ])

    const csvContent = [
      headers.join(","),
      // Quote every cell and double any embedded quote — notes are free text,
      // so they can legitimately contain commas, quotes and newlines.
      ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
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
    // Items are jsonb-array entries, not rows, so the DB can't cascade this —
    // drop the item's cost split here to avoid orphaned split rows.
    if (tripId && splits.has(id)) {
      supabase.from('item_cost_splits').delete().eq('trip_id', tripId).eq('item_id', id)
        .then(({ error }) => {
          if (!error) {
            setSplits(prev => {
              const next = new Map(prev)
              next.delete(id)
              return next
            })
          }
        })
    }
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
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
              setViewMode('list')
          }
      }
  }

  // Viewers (and anyone whose role hasn't resolved yet on a cloud trip they
  // don't own) get the same read-only layout as the public share page instead
  // of a second hand-rolled read-only mode. Realtime stays live above, so the
  // view still follows edits made by the owner/editors.
  if (tripId && role === 'viewer') {
    return (
      <SharedItineraryView
        title={itineraryTitle}
        items={items}
        currency={settings.defaultCurrency}
        rates={rates}
        ratesFetchedAt={ratesFetchedAt}
      />
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden relative">
        {/* Top band: trip title, dates, collaborators, settings (Screen 03) */}
        <PlannerHeader
            title={itineraryTitle}
            onTitleChange={setItineraryTitle}
            settings={settings}
            onSettingsUpdate={handleSettingsUpdate}
            onExport={handleExport}
            syncStatus={syncStatus}
            participants={tripId ? participants : undefined}
            onAddParticipant={tripId ? addParticipant : undefined}
            onRemoveParticipant={tripId ? removeParticipant : undefined}
            onlineUserIds={onlineUserIds}
            tripId={tripId}
            isLoggedIn={!!userId}
            isOwner={!tripId || role === 'owner'}
        />

        {/* Mobile timeline/map toggle (design doc, Screen 13) */}
        <div className="px-5 py-3 md:hidden">
          <div className="flex rounded-pill bg-muted p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex-1 rounded-pill py-2 text-[13px] transition-colors ${
                viewMode === 'list'
                  ? 'bg-card font-bold text-primary shadow-sm'
                  : 'font-semibold text-muted-foreground'
              }`}
            >
             Хуваарь
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex-1 rounded-pill py-2 text-[13px] transition-colors ${
                viewMode === 'map'
                  ? 'bg-card font-bold text-primary shadow-sm'
                  : 'font-semibold text-muted-foreground'
              }`}
            >
              Газрын зураг
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Left: Timeline (Scrollable) */}
            <div className={`
              ${viewMode === 'list' ? 'flex' : 'hidden'}
              md:flex w-full md:w-1/2 lg:w-5/12 overflow-y-auto bg-muted/10 h-full scrollbar-hide
            `}>
                <Timeline
                    items={items}
                    onAdd={addItem}
                    onUpdate={updateItem}
                    onDelete={deleteItem}
                    onMove={moveItem}
                    onHover={setHoveredId}
                    pickingLocationId={pickingLocationId}
                    onStartPicking={(id) => {
                        setPickingLocationId(id)
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                            setViewMode(id ? 'map' : 'list')
                        }
                    }}
                    newItemId={newItemId}
                    isManualAdd={isManualAdd}
                    isCompact={isCompact}
                    currency={settings.defaultCurrency}
                    rates={rates}
                    participants={tripId ? participants : undefined}
                    splits={splits}
                    onSplitChange={tripId ? updateSplit : undefined}
                />
            </div>

            {/* Right: Map (Sticky/Fixed on Desktop, Toggle on Mobile) */}
            <div className={`
              ${viewMode === 'map' ? 'flex' : 'hidden'} 
              md:flex md:w-1/2 lg:w-7/12 flex-1 h-full bg-muted border-l transition-all 
              ${pickingLocationId ? 'ring-4 ring-accent ring-inset' : ''}
            `}>
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
          tripId={tripId}
          isLoggedIn={!!userId}
          isOwner={!tripId || role === 'owner'}
          rates={rates}
          ratesFetchedAt={ratesFetchedAt}
          items={items}
          participants={participants}
          splits={splits}
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
