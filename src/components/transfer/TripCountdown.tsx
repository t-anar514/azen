"use client"

import * as React from "react"

/**
 * Time remaining until pickup. Bookings store no routed ETA, so this counts
 * down to `pickup_datetime` — which is exactly what a waiting passenger wants
 * to read anyway.
 *
 * Renders nothing until mounted: the value depends on the browser clock, so
 * server-rendering it would guarantee a hydration mismatch.
 */
export function TripCountdown({
  target,
  className,
  labelClassName,
}: {
  target: string
  className?: string
  labelClassName?: string
}) {
  const [remaining, setRemaining] = React.useState<number | null>(null)

  React.useEffect(() => {
    const end = new Date(target).getTime()
    if (Number.isNaN(end)) return

    const tick = () => setRemaining(Math.max(0, end - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  if (remaining === null) {
    return <span className={className}>—</span>
  }

  // Past pickup time: a frozen "00:00" under a "time until pickup" caption reads
  // like a broken clock, so say what's actually true instead.
  if (remaining === 0) {
    return (
      <span className={labelClassName} suppressHydrationWarning>
        Авах цаг болсон
      </span>
    )
  }

  const totalMinutes = Math.floor(remaining / 60000)

  // Under two hours the seconds matter (you're watching the kerb); beyond that
  // they're noise, so it degrades to hours and then days.
  let text: string
  if (totalMinutes >= 24 * 60) {
    text = `${Math.floor(totalMinutes / (24 * 60))} хоног`
  } else if (totalMinutes >= 120) {
    text = `${Math.floor(totalMinutes / 60)}ц`
  } else {
    const m = Math.floor(remaining / 60000)
    const s = Math.floor((remaining % 60000) / 1000)
    text = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  return (
    <>
      <span className={className} suppressHydrationWarning>
        {text}
      </span>
      <span className={labelClassName}>Авах цаг хүртэл</span>
    </>
  )
}
