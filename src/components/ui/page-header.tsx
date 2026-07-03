import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * PageHeader — left-aligned branded page header with the route-line divider.
 * Replaces the generic "centered title + accent underline" pattern on
 * /essentials, /hacks, /learn, /guides.
 *
 *   <PageHeader eyebrow="Заавал мэдэх" title="Хотын гарын авлага"
 *               lead="Хот бүрийн тээвэр, ёс зүй, мөнгө…"
 *               action={<Button>Загвар сонгох</Button>} />
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  action,
  className,
}: {
  eyebrow: string
  title: string
  lead?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {eyebrow}
          </span>
          <h1 className="mt-1.5 font-display text-3xl md:text-4xl font-extrabold tracking-tight text-foreground text-balance">
            {title}
          </h1>
          {lead && (
            <p className="mt-2.5 text-lg text-muted-foreground max-w-prose">{lead}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <RouteDivider />
    </header>
  )
}

function RouteDivider() {
  return (
    <div aria-hidden className="flex items-center gap-2 pt-1">
      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
      <span className="h-px flex-1 bg-gradient-to-r from-sky-500/60 via-border to-accent/60" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
    </div>
  )
}
