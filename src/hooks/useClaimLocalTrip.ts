"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export type ClaimDecision =
  | "checking" // conditions being evaluated — hold off creating a cloud trip
  | "none" // no local guest trip to claim — normal cloud-save behavior
  | "approved" // user said yes (or already has cloud trips) — save + clear local copy
  | "declined" // user said no — keep the trip local-only this session

const DECLINED_KEY = "azen_claim_declined"

// Bridges a guest's localStorage-only itinerary into their account after
// login. The actual insert still goes through the planner's existing
// debounced cloud-save path — this hook only decides whether that path may
// run (and the planner clears the local copy once the insert succeeds).
export function useClaimLocalTrip(userId: string | null, tripId: string | null): ClaimDecision {
  const [decision, setDecision] = useState<ClaimDecision>("checking")
  const promptedRef = useRef(false)

  useEffect(() => {
    // Viewing a specific cloud trip, or not logged in — nothing to claim;
    // guests keep working locally like before.
    if (tripId || !userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDecision("none")
      return
    }
    if (promptedRef.current) return

    const raw = localStorage.getItem("azen_itinerary_items")
    let hasLocalTrip = false
    try {
      hasLocalTrip = !!raw && (JSON.parse(raw) as unknown[]).length > 0
    } catch {
      hasLocalTrip = false
    }
    if (!hasLocalTrip) {
      setDecision("none")
      return
    }
    if (sessionStorage.getItem(DECLINED_KEY)) {
      setDecision("declined")
      return
    }

    const supabase = createClient()
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from("itineraries")
        .select("id")
        .eq("owner_id", userId)
        .limit(1)
      if (cancelled || promptedRef.current) return
      promptedRef.current = true
      if (data && data.length > 0) {
        // Already has cloud trips — keep the pre-existing silent-import
        // behavior rather than nagging.
        setDecision("approved")
        return
      }
      const ok = window.confirm(
        "Өмнө нь зочноор төлөвлөсөн аяллаа бүртгэлдээ хадгалах уу? Хадгалснаар бүх төхөөрөмжөөс нээх боломжтой болно."
      )
      if (ok) {
        setDecision("approved")
      } else {
        sessionStorage.setItem(DECLINED_KEY, "1")
        setDecision("declined")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, tripId])

  return decision
}
