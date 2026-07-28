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

export interface PlannerRealtimeOptions {
  // Fired on any INSERT/UPDATE/DELETE on the trip's participants or cost
  // splits (added to the supabase_realtime publication in 0018). The rows are
  // small, so the consumer just refetches instead of merging event payloads.
  onBudgetChange?: () => void
  // When set, this client is announced on the channel's presence keyed by the
  // user id, and onPresenceSync receives the ids of everyone currently on the
  // trip (including ourselves). Guests can still listen without tracking.
  presenceUserId?: string | null
  onPresenceSync?: (onlineUserIds: string[]) => void
}

// Live sync for /planner collaboration. Scope is deliberately last-write-wins
// at the row level (the existing debounced whole-row upsert), propagated
// within ~1s via Supabase Realtime — not per-item CRDT/OT merging, which is
// v2 scope. Postgres-changes events respect RLS, so subscribers only receive
// updates for trips they can already select.
export function usePlannerRealtime(
  tripId: string | null,
  onRemoteChange: (row: ItineraryRow) => void,
  options?: PlannerRealtimeOptions
) {
  const [supabase] = useState(() => createClient())
  const onBudgetChange = options?.onBudgetChange
  const presenceUserId = options?.presenceUserId ?? null
  const onPresenceSync = options?.onPresenceSync

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

      channel = supabase.channel(`itinerary:${tripId}`, {
        config: presenceUserId ? { presence: { key: presenceUserId } } : {},
      })

      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "itineraries", filter: `id=eq.${tripId}` },
        (payload) => onRemoteChange(payload.new as ItineraryRow)
      )

      if (onBudgetChange) {
        channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table: "trip_participants", filter: `trip_id=eq.${tripId}` },
          () => onBudgetChange()
        )
        channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table: "item_cost_splits", filter: `trip_id=eq.${tripId}` },
          () => onBudgetChange()
        )
      }

      if (onPresenceSync) {
        channel.on("presence", { event: "sync" }, () => {
          if (channel) onPresenceSync(Object.keys(channel.presenceState()))
        })
      }

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED" && presenceUserId && channel) {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })
    })()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [tripId, supabase, onRemoteChange, onBudgetChange, presenceUserId, onPresenceSync])
}
