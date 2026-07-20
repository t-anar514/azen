import * as React from "react"

import { cn } from "@/lib/utils"

export interface IconListItem {
  icon: React.ElementType
  title: string
  description: string
}

const TINTS = ["bg-tint-sky", "bg-tint-saffron", "bg-tint-sage", "bg-tint-lilac"]

// Tinted icon well + bold title + description
export function IconList({ items, className }: { items: IconListItem[]; className?: string }) {
  return (
    <ul className={cn("space-y-6", className)}>
      {items.map((item, i) => (
        <li key={item.title} className="flex gap-4">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-well",
              TINTS[i % TINTS.length]
            )}
          >
            <item.icon className="size-5 text-foreground/70" />
          </span>
          <span>
            <span className="block font-display font-bold text-foreground">{item.title}</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">{item.description}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
