"use client"

import * as React from "react"
import { track } from "@/lib/analytics"

/**
 * Fires one event when a server-rendered page mounts. Kept as a tiny client
 * island so pages stay server components.
 */
export function TrackView({ event, props }: { event: string; props?: Record<string, unknown> }) {
  const sent = React.useRef(false)
  const serialized = JSON.stringify(props ?? {})

  React.useEffect(() => {
    if (sent.current) return
    sent.current = true
    track(event, JSON.parse(serialized))
  }, [event, serialized])

  return null
}
