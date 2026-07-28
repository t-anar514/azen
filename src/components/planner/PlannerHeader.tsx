"use client"

import { useState } from "react"
import {
  AlertCircle,
  Check,
  Cloud,
  CloudOff,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SettingsModal, TripSettings } from "./SettingsModal"
import { ShareModal } from "./ShareModal"
import { ParticipantChips, participantInitial } from "./ParticipantChips"
import { formatMnRange } from "@/lib/planner/format"
import type { TripParticipant } from "@/lib/budget/splitBalances"
import type { SyncStatus } from "./Timeline"

interface PlannerHeaderProps {
  title: string
  onTitleChange: (newTitle: string) => void
  settings: TripSettings
  onSettingsUpdate: (settings: TripSettings) => void
  onExport: () => void
  syncStatus?: SyncStatus
  // Budget-split roster — cloud trips only (see planner/page.tsx).
  participants?: TripParticipant[]
  onAddParticipant?: (name: string) => void
  onRemoveParticipant?: (participantId: string) => void
  // User ids currently on the trip's realtime channel — linked participants
  // matching one of these get an online dot on their avatar.
  onlineUserIds?: string[]
  // Passed through to the share/invite dialog opened from the roster popover.
  tripId?: string | null
  isLoggedIn?: boolean
  isOwner?: boolean
}

// Top band of the planner (design doc Screen 03): editable trip title with the
// date range underneath, and on the right the collaborator avatar stack plus
// the settings button. The avatars open a popover with the full roster editor.
export function PlannerHeader({
  title,
  onTitleChange,
  settings,
  onSettingsUpdate,
  onExport,
  syncStatus,
  participants,
  onAddParticipant,
  onRemoveParticipant,
  onlineUserIds = [],
  tripId = null,
  isLoggedIn = false,
  isOwner = true,
}: PlannerHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempTitle, setTempTitle] = useState(title)
  const [rosterOpen, setRosterOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  // "Нэмэх" in the roster popover → real-user invite: close the popover and
  // open the share/invite dialog (rendered as a sibling to avoid nesting a
  // dialog inside a popover).
  const openInvite = () => {
    setRosterOpen(false)
    setShareOpen(true)
  }

  const submit = () => {
    if (tempTitle.trim()) onTitleChange(tempTitle.trim())
    setIsEditing(false)
  }

  const cancel = () => {
    setTempTitle(title)
    setIsEditing(false)
  }

  const rangeText = formatMnRange(settings.startDate, settings.endDate)

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 md:px-6">
      {/* ── title + dates ── */}
      <div className="min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit()
                if (e.key === "Escape") cancel()
              }}
              // Select-all on focus so typing replaces the old name instead of
              // appending to it.
              onFocus={(e) => e.target.select()}
              className="h-9 max-w-[240px] font-display text-lg font-bold md:max-w-sm"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-primary" onClick={submit}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={cancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className="group flex min-w-0 items-center gap-2 text-left"
            onClick={() => {
              setTempTitle(title)
              setIsEditing(true)
            }}
          >
            <h1 className="truncate font-display text-lg font-extrabold tracking-tight text-foreground md:text-xl">
              {title}
            </h1>
            <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100" />
            {/* sync status — small and out of the way, but honest */}
            <span className="shrink-0">
              {syncStatus === "syncing" && <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />}
              {syncStatus === "saved" && <Cloud className="h-3.5 w-3.5 text-muted-foreground" />}
              {syncStatus === "error" && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
              {syncStatus === "idle" && <CloudOff className="h-3.5 w-3.5 text-muted-foreground/30" />}
            </span>
          </button>
        )}
        {rangeText && <p className="mt-0.5 truncate text-xs text-muted-foreground md:text-sm">{rangeText}</p>}
      </div>

      {/* ── avatars + settings ── */}
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {participants && onAddParticipant && (
          <Popover open={rosterOpen} onOpenChange={setRosterOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="flex items-center" title="Оролцогчид">
                <span className="flex -space-x-2">
                  {participants.slice(0, 4).map((p) => {
                    const online = p.userId != null && onlineUserIds.includes(p.userId)
                    return (
                      <span key={p.id} className="relative">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card text-xs font-black text-white"
                          style={{ backgroundColor: p.color ?? "#64748b" }}
                          title={online ? `${p.displayName} — онлайн` : p.displayName}
                        >
                          {participantInitial(p.displayName)}
                        </span>
                        {online && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                        )}
                      </span>
                    )
                  })}
                </span>
                <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-secondary text-muted-foreground transition-colors hover:bg-secondary/70">
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <ParticipantChips
                participants={participants}
                onAdd={onAddParticipant}
                onRemove={onRemoveParticipant}
                onlineUserIds={onlineUserIds}
                onInvite={openInvite}
              />
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                «Нэмэх» дээр дарж бодит хэрэглэгчийг имэйлээр урина уу — урилга илгээмэгц
                тэдэнд мэдэгдэл очиж, зөвшөөрмөгц энд автоматаар нэгдэнэ.
              </p>
            </PopoverContent>
          </Popover>
        )}

        {/* Share/invite dialog opened by the roster "Нэмэх" button. Rendered
            as a sibling (not inside the popover) to avoid dialog-in-popover
            focus conflicts. */}
        <ShareModal
          tripId={tripId}
          isLoggedIn={isLoggedIn}
          isOwner={isOwner}
          trigger={null}
          open={shareOpen}
          onOpenChange={setShareOpen}
        />

        <SettingsModal
          settings={settings}
          onSave={onSettingsUpdate}
          onExport={onExport}
          trigger={
            <Button variant="outline" className="rounded-pill h-9 gap-1.5 px-4 text-sm font-semibold">
              <Settings className="h-4 w-4" /> Тохиргоо
            </Button>
          }
        />
      </div>
    </div>
  )
}
