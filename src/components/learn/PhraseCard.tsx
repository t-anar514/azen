"use client"

import React from "react"
import { Volume2 } from "lucide-react"
import type { PhraseRow } from "@/lib/supabase/types"
import { useTTS } from "@/hooks/use-tts"

/** Left-accent + audio-button tint, cycled so each column reads as its own colour. */
export const CARD_ACCENTS = [
  { bar: "#1A4E8A", chipBg: "#E4EEFB", chipFg: "#1A4E8A" }, // sky
  { bar: "#DE8C2E", chipBg: "#FCF2E3", chipFg: "#C9761E" }, // saffron
  { bar: "#2E8B6F", chipBg: "#E3F1EC", chipFg: "#2E8B6F" }, // success
] as const

interface PhraseCardProps {
  phrase: PhraseRow
  accent?: (typeof CARD_ACCENTS)[number]
}

export function PhraseCard({ phrase, accent = CARD_ACCENTS[0] }: PhraseCardProps) {
  const { speak, isSpeaking } = useTTS()

  return (
    <div
      className="relative flex items-start justify-between gap-4 overflow-hidden rounded-thumb border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderLeft: `4px solid ${accent.bar}` }}
    >
      <div className="min-w-0">
        <h3 className="font-display text-2xl font-bold leading-tight text-foreground md:text-3xl">
          {phrase.japanese}
        </h3>
        <p className="mt-1.5 text-sm italic text-muted-foreground">{phrase.romaji}</p>
        <p className="mt-2 text-base font-medium text-foreground">{phrase.english}</p>
      </div>

      <button
        type="button"
        onClick={() => speak(phrase.japanese, phrase.audio_url)}
        aria-label={`${phrase.romaji} дуудлага сонсох`}
        className="relative flex size-9 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
        style={{ background: accent.chipBg, color: accent.chipFg }}
      >
        <Volume2 className="size-4" />
        {isSpeaking && (
          <span
            className="absolute inset-0 animate-ping rounded-full border-2 opacity-75"
            style={{ borderColor: accent.chipFg }}
          />
        )}
      </button>
    </div>
  )
}
