import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * RouteLine — the Azen signature motif.
 * A hairline connecting an origin dot to a destination dot, echoing a
 * flight path / airport→city transfer. Use in transfer card headers,
 * as a section divider, and anywhere a journey is implied.
 *
 *   <RouteLine from="NRT" to="Шинжүкү" />   // labelled
 *   <RouteLine />                            // bare divider
 */
export function RouteLine({
  from,
  to,
  className,
}: {
  from?: string
  to?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
      {from && <span className="text-[0.8125rem] font-medium text-foreground">{from}</span>}
      <span aria-hidden className="flex flex-1 items-center min-w-8">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
        <span className="h-px flex-1 bg-gradient-to-r from-sky-500/60 via-border to-saffron/60" />
        <svg width="9" height="9" viewBox="0 0 9 9" className="shrink-0 -ml-px">
          <path
            d="M1 4.5h6M4.5 2l2.5 2.5L4.5 7"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {to && <span className="text-[0.8125rem] font-medium text-foreground">{to}</span>}
    </div>
  )
}
