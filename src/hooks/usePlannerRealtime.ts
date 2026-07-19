"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { ItemType } from "@/components/planner/Timeline"
import type { TripSettings } from "@/components/planner/SettingsModal"

export interface ItineraryRow {
  id: string
  owner_id: string
  title: string
  items: ItemType[]
  settings: TripSettings | null
  is_public: boolean
  updated_at: string
}

// Live sync for /planner collaboration. Scope is deliberately last-write-wins
// at the row level (the existing debounced whole-row upsert), propagated
// within ~1s via Supabase Realtime — not per-item CRDT/OT merging, which is
// v2 scope. Postgres-changes events respect RLS, so subscribers only receive
// updates for trips they can already select.
export function usePlannerRealtime(
  tripId: string | null,
  onRemoteChange: (row: ItineraryRow) => void
) {
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    if (!tripId) return
    let channel: RealtimeChannel | null = null
    let cancelled = false

    // RLS on realtime events is evaluated against the token the SOCKET holds,
    // not the one REST calls use. If we subscribe before the restored session
    // reaches the socket, it authenticates as anon and events for private
    // trips are silently filtered out — so push the JWT explicitly first.
    // (Verified against live Supabase: without setAuth the event never
    // arrives; with it, delivery is <1s.)
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        await supabase.realtime.setAuth(data.session.access_token)
      }
      if (cancelled) return
      channel = supabase
        .channel(`itinerary:${tripId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "itineraries", filter: `id=eq.${tripId}` },
          (payload) => onRemoteChange(payload.new as ItineraryRow)
        )
        .subscribe()
    })()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [tripId, supabase, onRemoteChange])
}
