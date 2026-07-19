"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Users, Check } from "lucide-react"
import type { TripParticipant } from "@/lib/budget/splitBalances"

interface ParticipantChipsProps {
  participants: TripParticipant[]
  onAdd: (name: string) => void
  onRemove?: (participantId: string) => void
  readOnly?: boolean
}

export function participantInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?"
}

// Roster row for group budget splitting: everyone in the cost split, whether
// or not they have an Azen account ("ghost" participants are just a name).
export function ParticipantChips({ participants, onAdd, onRemove, readOnly = false }: ParticipantChipsProps) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")

  const submit = () => {
    if (!name.trim()) return
    onAdd(name)
    setName("")
    setAdding(false)
  }

  return (
    <div className="w-full flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center gap-1 text-muted-foreground shrink-0">
        <Users className="h-3.5 w-3.5" />
        <span className="text-[10px] font-black uppercase tracking-widest">Оролцогчид</span>
      </div>

      {participants.map((p) => (
        <span
          key={p.id}
          className="group/chip flex items-center gap-1.5 rounded-full border bg-card pl-1 pr-2 py-0.5 text-xs font-medium shadow-sm"
        >
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
            style={{ backgroundColor: p.color ?? "#64748b" }}
          >
            {participantInitial(p.displayName)}
          </span>
          {p.displayName}
          {!readOnly && onRemove && (
            <button
              onClick={() => onRemove(p.id)}
              className="ml-0.5 text-muted-foreground/50 hover:text-destructive transition-colors"
              title="Хасах"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}

      {!readOnly && (
        adding ? (
          <span className="flex items-center gap-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit()
                if (e.key === "Escape") setAdding(false)
              }}
              placeholder="Нэр..."
              className="h-7 w-28 text-xs rounded-full px-3"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-accent" onClick={submit}>
              <Check className="h-3.5 w-3.5" />
            </Button>
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdding(true)}
            className="h-7 rounded-full px-3 text-xs border-dashed"
          >
            <Plus className="h-3 w-3 mr-1" /> Нэмэх
          </Button>
        )
      )}
    </div>
  )
}
