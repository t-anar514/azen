import { AlertTriangle, Lightbulb, Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import type { CalloutTone } from "@/lib/blog/article"

/**
 * The navy "fastest answer" panel that sits directly under the hero — the one
 * thing a reader should get even if they read nothing else.
 */
export function QuickAnswer({ id, text }: { id: string; text: string }) {
  return (
    <aside
      id={id}
      className="scroll-mt-28 rounded-card bg-gradient-to-br from-sky-900 to-sky-700 px-5 py-5 sm:px-6"
    >
      <div className="flex gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-well bg-white/15">
          <Zap className="h-4.5 w-4.5 text-white" aria-hidden />
        </span>
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
            Хамгийн хурдан шийдэл
          </p>
          <p className="text-[15px] font-medium leading-relaxed text-white sm:text-base">
            {text}
          </p>
        </div>
      </div>
    </aside>
  )
}

const TONE = {
  warn: {
    wrap: "border-saffron/30 bg-tint-saffron",
    icon: "text-saffron-600",
    title: "text-saffron-600",
    Icon: AlertTriangle,
  },
  tip: {
    wrap: "border-success/25 bg-tint-sage",
    icon: "text-success",
    title: "text-success",
    Icon: Lightbulb,
  },
  note: {
    wrap: "border-sky-200 bg-tint-sky",
    icon: "text-sky-700",
    title: "text-sky-700",
    Icon: Zap,
  },
} as const

/**
 * Inline warning / tip panels. `warn` renders its title inline with the body
 * copy (the design runs them as one sentence), `tip` stacks a labelled header
 * above the copy in a circular badge.
 */
export function ArticleCallout({
  id,
  tone,
  title,
  text,
  className,
}: {
  id?: string
  tone: CalloutTone
  title: string | null
  text: string
  className?: string
}) {
  const { wrap, icon, title: titleColor, Icon } = TONE[tone]
  const stacked = tone !== "warn"

  return (
    <aside
      id={id}
      className={cn(
        "scroll-mt-28 rounded-thumb border px-4 py-3.5",
        wrap,
        className
      )}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center",
            stacked
              ? cn("h-7 w-7 rounded-full bg-white/70", icon)
              : cn("pt-0.5", icon)
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="space-y-1">
          {title && stacked && (
            <p className={cn("text-[13px] font-bold", titleColor)}>{title}</p>
          )}
          <p className="text-[13.5px] leading-relaxed text-foreground/80">
            {title && !stacked && (
              <span className={cn("font-bold", titleColor)}>{title} </span>
            )}
            {text}
          </p>
        </div>
      </div>
    </aside>
  )
}
