import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface KpiTileProps {
  icon: LucideIcon
  label: string
  value: number | string
  /** Percent change vs. the prior 7-day window — green ▲ / red ▼. */
  delta?: number
  /** Shown instead of delta when there's no meaningful week-over-week comparison. */
  sub?: string
  /** Per-metric icon tint (mockup varies this: sky/destructive/saffron-600/filled saffron). */
  iconClassName?: string
}

/** KPI stat tile (design doc, Screen 09/10) — icon top-right, big display value, delta or sub line. */
export function KpiTile({ icon: Icon, label, value, delta, sub, iconClassName }: KpiTileProps) {
  const displayValue = typeof value === "number" ? value.toLocaleString("mn-MN") : value

  return (
    <div className="rounded-card border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <Icon className={cn("size-[15px] shrink-0", iconClassName ?? "text-primary")} strokeWidth={2} />
      </div>
      <div className="mt-1.5 font-display text-2xl font-extrabold text-foreground">{displayValue}</div>
      {delta !== undefined ? (
        <div className={cn("text-[11.5px] font-semibold", delta >= 0 ? "text-success" : "text-destructive")}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% энэ 7 хоног
        </div>
      ) : sub ? (
        <div className="text-[11.5px] font-semibold text-muted-foreground">{sub}</div>
      ) : null}
    </div>
  )
}
