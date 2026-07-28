"use client"

import { useTranslations } from "next-intl"
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { TimelineItem } from "./TimelineItem"
import { formatMnDay, nearestCityName } from "@/lib/planner/format"
import { FALLBACK_RATES, Rates } from "@/lib/currency/format"
import type { TripParticipant, CostSplit } from "@/lib/budget/splitBalances"

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
  /**
   * Free-text note for the activity (opening hours, what to bring, tips…).
   * Persists with the rest of the item: the whole array is written to the
   * `itineraries.items` jsonb column, so no migration is needed — but it stays
   * optional so items written before this field existed still parse.
   */
  notes?: string
}

interface TimelineProps {
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
  currency?: "MNT" | "USD" | "JPY"
  rates?: Rates
  // Budget splitting — only provided for cloud trips (see planner/page.tsx).
  participants?: TripParticipant[]
  splits?: Map<string, CostSplit>
  onSplitChange?: (itemId: string, paidBy: string | null, splitBetween: string[]) => void
}

// One day-group of the itinerary: the Nth distinct date, its items, and (when
// resolvable from the day's coordinates) which city that day happens in.
interface DayGroup {
  date: string
  dayNumber: number
  city: string | null
  items: { item: ItemType; index: number }[]
}

function groupByDay(items: ItemType[]): DayGroup[] {
  const groups: DayGroup[] = []
  let current: DayGroup | null = null

  items.forEach((item, i) => {
    if (!current || current.date !== item.date) {
      current = { date: item.date, dayNumber: groups.length + 1, city: null, items: [] }
      groups.push(current)
    }
    current.items.push({ item, index: i + 1 })
  })

  for (const group of groups) {
    const located = group.items.find(({ item }) => item.lat != null && item.lng != null)
    if (located) group.city = nearestCityName(located.item.lat!, located.item.lng!)
  }

  return groups
}

export function Timeline({
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
    currency = "JPY",
    rates = FALLBACK_RATES,
    participants,
    splits,
    onSplitChange
}: TimelineProps) {
  const t = useTranslations("Planner")

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

  const dayGroups = groupByDay(items)

  return (
    <div className="w-full p-3 md:p-5 pb-28">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* One sortable context across all days — items can only actually swap
            within the same date (enforced in onMove), but a single context
            keeps drag transforms stable across the whole list. */}
        <SortableContext
          items={items}
          strategy={verticalListSortingStrategy}
        >
          <div className="w-full space-y-5">
            {dayGroups.map((group) => (
              <section key={group.date}>
                {/* ── day header ── */}
                <div className="mb-2 flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ background: "#0C1826" }}
                    >
                      {group.dayNumber}
                    </span>
                    <h3 className="text-sm font-bold text-foreground md:text-base">
                      {formatMnDay(group.date)}
                    </h3>
                  </div>
                  {group.city && (
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">{group.city}</span>
                  )}
                </div>

                {/* ── the day's activities ── */}
                <div className="space-y-2">
                  {group.items.map(({ item, index }) => (
                    <TimelineItem
                      key={item.id}
                      {...item}
                      index={index}
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
                      rates={rates}
                      participants={participants}
                      split={splits?.get(item.id) ?? null}
                      onSplitChange={
                        onSplitChange
                          ? (paidBy, splitBetween) => onSplitChange(item.id, paidBy, splitBetween)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* ── add activity (design: full-width card at the end of the list) ── */}
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
      >
        <Plus className="h-4 w-4" /> {t("addActivity")}
      </button>
    </div>
  )
}
