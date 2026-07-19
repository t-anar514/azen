"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CalendarPlus, Check } from "lucide-react"
import type { ItemType, ActivityType } from "@/components/planner/Timeline"
import { useExchangeRates } from "@/hooks/useExchangeRates"

interface AddToPlannerButtonProps {
  title: string
  date: string // YYYY-MM-DD
  type: ActivityType
  location: string
  // Cost in the source flow's currency; converted to JPY (the planner's
  // storage currency) with the cached FX rates before saving.
  cost: number
  costCurrency: "JPY" | "MNT" | "USD"
  lat?: number
  lng?: number
}

// "Add to my trip planner" cross-link for booking confirmation pages: appends
// a prefilled item to the user's most recent cloud trip (or the guest's
// localStorage trip) through the same items-array shape addItem/updateItem use.
export function AddToPlannerButton({ title, date, type, location, cost, costCurrency, lat, lng }: AddToPlannerButtonProps) {
  const [state, setState] = useState<"idle" | "working" | "added" | "error">("idle")
  const [plannerHref, setPlannerHref] = useState("/planner")
  const { rates } = useExchangeRates()

  const buildItem = (): ItemType => {
    const rate = rates[costCurrency]
    const costJpy =
      costCurrency === "JPY" || !rate ? Math.round(cost) : Math.round(cost / rate)
    return {
      id: `item-${Date.now()}`,
      title,
      date,
      type,
      location,
      cost: costJpy,
      lat,
      lng,
    }
  }

  const isDuplicate = (items: ItemType[]) =>
    items.some((i) => i.title === title && i.date === date)

  async function handleAdd() {
    setState("working")
    const item = buildItem()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Guest: append to the localStorage trip the planner already reads.
      try {
        const raw = localStorage.getItem("azen_itinerary_items")
        const items = (raw ? JSON.parse(raw) : []) as ItemType[]
        if (!isDuplicate(items)) {
          localStorage.setItem("azen_itinerary_items", JSON.stringify([...items, item]))
        }
        setPlannerHref("/planner")
        setState("added")
      } catch {
        setState("error")
      }
      return
    }

    // Logged in: append to the most recently touched trip they own, or start
    // a fresh one if they have none.
    const { data: trip } = await supabase
      .from("itineraries")
      .select("id, items")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (trip) {
      const items = (trip.items ?? []) as ItemType[]
      const nextItems = isDuplicate(items) ? items : [...items, item]
      const { error } = await supabase
        .from("itineraries")
        .update({ items: nextItems, updated_at: new Date().toISOString() })
        .eq("id", trip.id)
      if (error) {
        setState("error")
        return
      }
      setPlannerHref(`/planner?trip=${trip.id}`)
      setState("added")
    } else {
      // Client-generated id, plain INSERT — .insert().select() would need the
      // SELECT policy to pass on the brand-new row (see migration 0010).
      const newTripId = crypto.randomUUID()
      const { error } = await supabase
        .from("itineraries")
        .insert([{ id: newTripId, title: "Аяллын төлөвлөгөө", items: [item], owner_id: user.id }])
      if (error) {
        setState("error")
        return
      }
      setPlannerHref(`/planner?trip=${newTripId}`)
      setState("added")
    }
  }

  if (state === "added") {
    return (
      <Button asChild variant="outline" className="rounded-full">
        <Link href={plannerHref}>
          <Check className="h-4 w-4 mr-2 text-emerald-600" />
          Төлөвлөгөөнд нэмэгдлээ — харах
        </Link>
      </Button>
    )
  }

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <Button
        variant="outline"
        className="rounded-full"
        onClick={handleAdd}
        disabled={state === "working"}
      >
        <CalendarPlus className="h-4 w-4 mr-2" />
        Аяллын төлөвлөгөөнд нэмэх
      </Button>
      {state === "error" && (
        <p className="text-xs text-destructive">Нэмж чадсангүй — дахин оролдоно уу.</p>
      )}
    </div>
  )
}
