"use client"
import { useEffect } from "react"
import { track } from "@/lib/analytics"
export function TrackProfileView({ guideId }: { guideId: string }) {
  useEffect(() => { track("guide_profile_viewed", { guide_id: guideId }) }, [guideId])
  return null
}
