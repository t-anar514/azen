"use client"

import { useEffect, useState } from "react"

/**
 * true only after the component has mounted on the client.
 *
 * Use to keep third-party components that generate their own ids (Radix's
 * `useId`) out of the hydration pass: render an identical static element on the
 * server / first paint, then upgrade to the interactive version once mounted,
 * so server and client hydration trees never disagree on generated ids.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
