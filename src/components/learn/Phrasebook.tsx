"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { phraseCollections } from "@/data/japanese-course"
import { PhraseCard } from "./PhraseCard"
import { Sparkles, Trophy } from "lucide-react"
import { useTranslations } from "next-intl"

export function Phrasebook() {
  const t = useTranslations("Learn.phrasebook");
  const [activeTab, setActiveTab] = useState(0)
  const [learnedPhrases, setLearnedPhrases] = useState<Record<string, boolean>>({})

  // Load learned state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("azen-learned-phrases")
    if (saved) {
      try {
        setLearnedPhrases(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse learned phrases", e)
      }
    }
  }, [])

  // Save to localStorage whenever learned state changes
  useEffect(() => {
    localStorage.setItem("azen-learned-phrases", JSON.stringify(learnedPhrases))
  }, [learnedPhrases])

  const toggleLearned = (phraseKey: string, isLearned: boolean) => {
    setLearnedPhrases(prev => ({
      ...prev,
      [phraseKey]: isLearned
    }))
  }

  const currentCollection = phraseCollections[activeTab]
  const learnedCount = Object.values(learnedPhrases).filter(Boolean).length
  const totalPhrases = phraseCollections.reduce((acc, col) => acc + col.phrases.length, 0)

  return (
    <div className="py-12 max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#1c315e] flex items-center gap-2">
            <Sparkles className="text-[#227c70]" />
            {t("title")}
          </h2>
          <p className="text-gray-600 mt-1">{t("subtitle")}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-[#88a47c]/30">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-[#1c315e]">{t("learned", { learned: learnedCount, total: totalPhrases })}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide gap-2 md:gap-4 sticky top-20 z-30 bg-[#e6e2c3] py-2 -mx-4 px-4 md:static md:bg-transparent">
        {phraseCollections.map((collection, idx) => (
          <button
            key={collection.id}
            onClick={() => setActiveTab(idx)}
            className={`
              whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all
              ${activeTab === idx 
                ? "bg-[#1c315e] text-white shadow-md transform scale-105" 
                : "bg-white text-gray-600 hover:bg-white/80 hover:text-[#1c315e]"}
            `}
          >
            {t(`collections.${collection.id}.title`)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
         <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#1c315e]">{t(`collections.${currentCollection.id}.title`)}</h3>
                <p className="text-gray-600">{t(`collections.${currentCollection.id}.description`)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {currentCollection.phrases.map((phrase, idx) => {
                  const phraseKey = `${phrase.romaji}-${currentCollection.title}`
                  return (
                    <motion.div
                      key={phraseKey}
                      initial={{ opacity: 1 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.x < -100 && activeTab < phraseCollections.length - 1) {
                          setActiveTab(prev => prev + 1)
                        } else if (info.offset.x > 100 && activeTab > 0) {
                          setActiveTab(prev => prev - 1)
                        }
                      }}
                      className="touch-pan-y"
                    >
                      <PhraseCard 
                        phrase={phrase}
                        collectionId={currentCollection.id}
                        isLearned={!!learnedPhrases[phraseKey]}
                        onToggleLearned={(val) => toggleLearned(phraseKey, val)}
                      />
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  )
}
