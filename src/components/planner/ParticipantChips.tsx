"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Users, Check, BadgeCheck, UserPlus } from "lucide-react"
import type { TripParticipant } from "@/lib/budget/splitBalances"

interface ParticipantChipsProps {
  participants: TripParticipant[]
  onAdd: (name: string) => void
  onRemove?: (participantId: string) => void
  readOnly?: boolean
  // Realtime presence — linked participants in this list show as online.
  onlineUserIds?: string[]
  // When provided, the primary "add" action invites a real Azen user (opens
  // the share modal) instead of adding an inline ghost name. Ghost-add stays
  // available as a secondary option so cost-splitting with non-users still works.
  onInvite?: () => void
}

export function participantInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?"
}

// Roster row for group budget splitting: everyone in the cost split, whether
// or not they have an Azen account ("ghost" participants are just a name).
export function ParticipantChips({ participants, onAdd, onRemove, readOnly = false, onlineUserIds = [], onInvite }: ParticipantChipsProps) {
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

      {participants.map((p) => {
        const isLinked = p.userId != null
        const isOnline = isLinked && onlineUserIds.includes(p.userId!)
        return (
          <span
            key={p.id}
            className="group/chip flex items-center gap-1.5 rounded-full border bg-card pl-1 pr-2 py-0.5 text-xs font-medium shadow-sm"
          >
            <span className="relative">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
                style={{ backgroundColor: p.color ?? "#64748b" }}
              >
                {participantInitial(p.displayName)}
              </span>
              {isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-card bg-emerald-500" />
              )}
            </span>
            {p.displayName}
            {isLinked && (
              <BadgeCheck className="h-3.5 w-3.5 text-sky-500" aria-label="Бүртгэлтэй хэрэглэгч" />
            )}
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
        )
      })}

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
        ) : onInvite ? (
          // Primary action invites a real Azen user (opens the share modal).
          <Button
            size="sm"
            onClick={onInvite}
            className="h-7 rounded-full px-3 text-xs"
          >
            <UserPlus className="h-3 w-3 mr-1" /> Нэмэх
          </Button>
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

      {/* Secondary: add a name for someone with no account (cost-split only). */}
      {!readOnly && onInvite && !adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Бүртгэлгүй хүн нэмэх
        </button>
      )}
    </div>
  )
}
