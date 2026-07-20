import * as React from "react"

import { cn } from "@/lib/utils"

export interface ProcessStep {
  title: string
  description: string
}

// Ghost-numeral step row: 01 · 02 · 03
export function ProcessRow({
  steps,
  className,
}: {
  steps: ProcessStep[]
  className?: string
}) {
  return (
    <div className={cn("grid gap-8 md:grid-cols-3", className)}>
      {steps.map((step, i) => (
        <div key={step.title} className="relative pt-10">
          <span
            aria-hidden
            className="absolute left-0 top-0 font-display text-6xl font-extrabold leading-none text-primary/10"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="relative font-display text-xl font-bold text-foreground">{step.title}</h3>
          <p className="relative mt-2 text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  )
}
