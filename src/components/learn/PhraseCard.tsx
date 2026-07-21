"use client"

import React from "react"
import { motion } from "framer-motion"
import { Volume2, Check } from "lucide-react"
import type { PhraseRow } from "@/lib/supabase/types"
import { useTTS } from "@/hooks/use-tts"
import { useTranslations } from "next-intl"

interface PhraseCardProps {
  phrase: PhraseRow
  onToggleLearned: (isLearned: boolean) => void
  isLearned: boolean
}

export function PhraseCard({ phrase, onToggleLearned, isLearned }: PhraseCardProps) {
  const tCommon = useTranslations("Learn.phrasebook");
  const { speak, isSpeaking } = useTTS()

  const handlePlay = () => {
    speak(phrase.japanese, phrase.audio_url)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        rounded-card border bg-card shadow-sm transition-colors p-6 flex flex-col gap-4 relative overflow-hidden
        ${isLearned ? "border-primary bg-tint-sky/40" : "border-border hover:border-primary/50"}
      `}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-1">{phrase.japanese}</h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{phrase.romaji}</p>
        </div>
        <button
          onClick={handlePlay}
          className={`
            p-4 md:p-3 rounded-full transition-all relative shrink-0
            ${isSpeaking ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary hover:text-white"}
          `}
          aria-label="Play audio"
        >
          <Volume2 className="w-6 h-6 md:w-5 md:h-5 text-current" />
          {isSpeaking && (
            <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75" />
          )}
        </button>
      </div>

      <div className="flex-1">
        <p className="text-lg text-foreground font-medium mb-2">{phrase.english}</p>

        {phrase.context && (
          <div className="inline-flex items-center gap-2 rounded-pill bg-tint-saffron px-3 py-1 text-xs font-bold text-saffron-600">
            <span>Azen Tip</span>
            <span className="font-normal border-l border-saffron-600/30 pl-2 ml-1">{phrase.context}</span>
          </div>
        )}
      </div>

       <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div
              className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
                ${isLearned ? "bg-primary border-primary text-white" : "border-border group-hover:border-primary text-transparent"}
              `}
              onClick={() => onToggleLearned(!isLearned)}
            >
              <Check className="w-4 h-4" />
            </div>
            <span className={`text-sm font-medium transition-colors ${isLearned ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>
              {isLearned ? tCommon("learnedState.learned") : tCommon("learnedState.markAsLearned")}
            </span>
          </label>
       </div>
    </motion.div>
  )
}
