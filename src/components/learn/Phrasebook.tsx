"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { PhraseCollectionRow } from "@/lib/supabase/types"
import { PhraseCard, CARD_ACCENTS } from "./PhraseCard"

interface PhrasebookProps {
  collections: PhraseCollectionRow[]
}

export function Phrasebook({ collections }: PhrasebookProps) {
  const [activeTab, setActiveTab] = useState(0)

  if (collections.length === 0) {
    return null
  }

  const currentCollection = collections[Math.min(activeTab, collections.length - 1)]

  return (
    <div className="mx-auto max-w-content px-4 py-10 md:px-6 md:py-12">
      {/* Category pills */}
      <div className="mb-8 flex flex-wrap gap-2.5">
        {collections.map((collection, idx) => {
          const active = activeTab === idx
          return (
            <button
              key={collection.id}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`rounded-pill border px-5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {collection.title}
            </button>
          )
        })}
      </div>

      {/* Phrase grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCollection.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {currentCollection.phrases.map((phrase, idx) => (
            <PhraseCard
              key={`${phrase.romaji}-${idx}`}
              phrase={phrase}
              accent={CARD_ACCENTS[idx % CARD_ACCENTS.length]}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
