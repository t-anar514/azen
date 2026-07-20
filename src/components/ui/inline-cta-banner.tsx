import * as React from "react"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TINTS = {
  sky: "bg-tint-sky",
  saffron: "bg-tint-saffron",
  sage: "bg-tint-sage",
  lilac: "bg-tint-lilac",
} as const

// Tinted rounded bar: copy left, pill button right.
export function InlineCtaBanner({
  title,
  description,
  ctaLabel,
  href,
  tint = "sky",
  className,
}: {
  title: string
  description?: string
  ctaLabel: string
  href: React.ComponentProps<typeof Link>["href"]
  tint?: keyof typeof TINTS
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-card p-6 md:p-8",
        TINTS[tint],
        className
      )}
    >
      <div className="max-w-lg">
        <p className="font-display text-xl font-bold text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-foreground/70">{description}</p>}
      </div>
      <Button asChild variant="reserve" className="rounded-pill shrink-0">
        <Link href={href as any}>{ctaLabel}</Link>
      </Button>
    </div>
  )
}
