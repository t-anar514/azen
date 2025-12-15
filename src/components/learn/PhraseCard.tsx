"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Volume2, Check } from "lucide-react"
import { Phrase } from "@/data/japanese-course"

interface PhraseCardProps {
  phrase: Phrase
  onToggleLearned: (isLearned: boolean) => void
  isLearned: boolean
}

export function PhraseCard({ phrase, onToggleLearned, isLearned }: PhraseCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    setIsPlaying(true)
    console.log(`Playing audio for: ${phrase.japanese}`)
    setTimeout(() => setIsPlaying(false), 2000) // Simulate playback
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        bg-white rounded-xl shadow-sm border transition-colors p-6 flex flex-col gap-4 relative overflow-hidden
        ${isLearned ? "border-[#227c70] bg-[#227c70]/5" : "border-[#88a47c]/20 hover:border-[#227c70]"}
      `}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-[#1c315e] mb-1 font-sans-jp">{phrase.japanese}</h3>
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">{phrase.romaji}</p>
        </div>
        <button
          onClick={handlePlay}
          className={`
            p-3 rounded-full transition-all relative
            ${isPlaying ? "bg-[#227c70] text-white" : "bg-gray-100 text-gray-600 hover:bg-[#227c70] hover:text-white"}
          `}
          aria-label="Play audio"
        >
          <Volume2 className="w-5 h-5" />
          {isPlaying && (
            <span className="absolute inset-0 rounded-full border-2 border-[#227c70] animate-ping opacity-75" />
          )}
        </button>
      </div>

      <div className="flex-1">
        <p className="text-lg text-gray-800 font-medium mb-2">{phrase.english}</p>
        
        {phrase.context && (
          <div className="inline-flex items-center gap-2 bg-[#88a47c] text-white text-xs font-bold px-3 py-1 rounded-full">
            <span>Zen Tip</span>
            <span className="font-normal opacity-90 border-l border-white/30 pl-2 ml-1">{phrase.context}</span>
          </div>
        )}
      </div>

       <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div 
              className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
                ${isLearned ? "bg-[#227c70] border-[#227c70] text-white" : "border-gray-300 group-hover:border-[#227c70] text-transparent"}
              `}
              onClick={() => onToggleLearned(!isLearned)}
            >
              <Check className="w-4 h-4" />
            </div>
            <span className={`text-sm font-medium transition-colors ${isLearned ? "text-[#227c70]" : "text-gray-500 group-hover:text-[#227c70]"}`}>
              {isLearned ? "Learned" : "Mark as learned"}
            </span>
          </label>
       </div>
    </motion.div>
  )
}
