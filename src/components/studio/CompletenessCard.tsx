import Link from "next/link"
import { CheckCircle2, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

interface CompletenessItem {
  key: string
  label: string
  done: boolean
}

interface CompletenessCardProps {
  pct: number
  items: CompletenessItem[]
}

/** "Профайлын бүрэн байдал" card (design doc, Screen 09/10). */
export function CompletenessCard({ pct, items }: CompletenessCardProps) {
  return (
    <div className="rounded-card border border-border bg-card p-5">
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="font-display text-[15px] font-bold">Профайлын бүрэн байдал</h2>
        <span className="font-display text-[15px] font-extrabold text-success">{pct}%</span>
      </div>
      <div className="mb-3.5 h-2 overflow-hidden rounded-pill bg-muted">
        <div
          className="h-full rounded-pill bg-gradient-to-r from-primary to-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.key}
            href="/studio/profile"
            className={cn(
              "flex items-center gap-2 text-[12.5px] transition-colors hover:text-foreground",
              item.done ? "text-muted-foreground" : "font-semibold text-foreground"
            )}
          >
            {item.done ? (
              <CheckCircle2 className="size-[15px] shrink-0 text-success" />
            ) : (
              <Circle className="size-[15px] shrink-0 text-border" />
            )}
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
