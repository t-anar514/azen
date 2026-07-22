"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

interface TagChipsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  /** Label on the dashed "add" pill — e.g. "+ Шошго нэмэх". */
  addLabel: string
  className?: string
}

/**
 * Shared chip editor for `tags: string[]` fields (design doc Screen 11's
 * "Шошго" row). Reused by CreateRecommendationForm and ProfileEditForm so
 * the add/remove interaction only lives in one place.
 */
export function TagChipsInput({ value, onChange, addLabel, className }: TagChipsInputProps) {
  const [draft, setDraft] = React.useState("")
  const [adding, setAdding] = React.useState(false)

  function commit() {
    const t = draft.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setDraft("")
    setAdding(false)
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 rounded-pill bg-secondary px-3.5 py-1.5 text-[13px] font-semibold text-primary"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            aria-label={`${tag} хасах`}
            className="text-primary/60 transition-colors hover:text-primary"
          >
            <X className="size-3" strokeWidth={2.5} />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commit()
            }
            if (e.key === "Escape") {
              setDraft("")
              setAdding(false)
            }
          }}
          onBlur={commit}
          placeholder="Шошго…"
          className="w-28 rounded-pill border border-border bg-card px-3.5 py-1.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-pill border border-dashed border-border px-3.5 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {addLabel}
        </button>
      )}
    </div>
  )
}
