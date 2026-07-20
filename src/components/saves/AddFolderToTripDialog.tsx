"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarPlus, Check, Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ItemType, ActivityType } from "@/components/planner/Timeline"
import type { PlaceCategory, PlaceRow } from "@/lib/supabase/types"

const CATEGORY_TO_ACTIVITY: Record<PlaceCategory, ActivityType> = {
  things_to_do: "sightseeing",
  places_to_eat: "food",
  nightlife: "nightlife",
  shopping: "shopping",
  day_trip: "spot",
}

interface TripOption {
  id: string
  title: string
  items: ItemType[]
}

interface AddFolderToTripDialogProps {
  folderName: string
  places: PlaceRow[]
}

// The bridge that makes folders more than a wishlist: saved places flow into
// the collaborative planner (and from there into cost splits and transfers).
export function AddFolderToTripDialog({ folderName, places }: AddFolderToTripDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [trips, setTrips] = React.useState<TripOption[] | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [done, setDone] = React.useState<{ tripId: string; added: number } | null>(null)

  React.useEffect(() => {
    if (!open || trips !== null) return
    let cancelled = false
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("itineraries")
        .select("id, title, items")
        .eq("owner_id", user.id)
        .order("updated_at", { ascending: false })
      if (!cancelled) setTrips((data ?? []) as TripOption[])
    }
    load()
    return () => {
      cancelled = true
    }
  }, [open, trips])

  function buildItems(existing: ItemType[]): ItemType[] {
    // append on the trip's last day so the owner drags them into place
    const dates = existing.map((i) => i.date).filter(Boolean).sort()
    const date = dates[dates.length - 1] ?? new Date().toISOString().slice(0, 10)
    const have = new Set(existing.map((i) => i.title))
    return places
      .filter((p) => !have.has(p.name))
      .map((p, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        title: p.name,
        date,
        type: CATEGORY_TO_ACTIVITY[p.category],
        location: p.neighborhood ?? "",
        cost: 0,
        lat: p.lat ?? undefined,
        lng: p.lng ?? undefined,
      }))
  }

  async function addToTrip(trip: TripOption | null) {
    setBusy(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setBusy(false)
      return
    }

    if (trip) {
      const newItems = buildItems(trip.items ?? [])
      const { error } = await supabase
        .from("itineraries")
        .update({
          items: [...(trip.items ?? []), ...newItems],
          updated_at: new Date().toISOString(),
        })
        .eq("id", trip.id)
      if (!error) setDone({ tripId: trip.id, added: newItems.length })
    } else {
      // new trip: client-generated id, plain INSERT (see migration 0010 note)
      const newTripId = crypto.randomUUID()
      const newItems = buildItems([])
      const { error } = await supabase
        .from("itineraries")
        .insert([{ id: newTripId, title: folderName, items: newItems, owner_id: user.id }])
      if (!error) setDone({ tripId: newTripId, added: newItems.length })
    }
    setBusy(false)
  }

  if (places.length === 0) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setDone(null)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <CalendarPlus className="size-4" /> Аяллын төлөвлөгөөнд нэмэх
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            “{folderName}” — {places.length} газрыг төлөвлөгөөнд нэмэх
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="space-y-4 py-2">
            <p className="flex items-center gap-2 text-sm text-foreground">
              <Check className="size-4 text-success" />
              {done.added > 0
                ? `${done.added} газар нэмэгдлээ.`
                : "Бүх газар аль хэдийн төлөвлөгөөнд байна."}
            </p>
            <Button asChild variant="reserve" className="rounded-full">
              <Link href={`/planner?trip=${done.tripId}`}>Төлөвлөгөө үзэх</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            {trips === null ? (
              <p className="text-sm text-muted-foreground">Уншиж байна…</p>
            ) : (
              <>
                {trips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    disabled={busy}
                    onClick={() => addToTrip(trip)}
                    className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <span>{trip.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {(trip.items ?? []).length} үйл ажиллагаа
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => addToTrip(null)}
                  className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-primary hover:bg-muted transition-colors"
                >
                  <Plus className="size-4" /> Шинэ аялал үүсгэх
                </button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
