"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Volume2 } from "lucide-react"

const vowels = [
  { char: "あ", romaji: "A", color: "bg-red-500" },
  { char: "い", romaji: "I", color: "bg-blue-500" },
  { char: "う", romaji: "U", color: "bg-yellow-500" },
  { char: "え", romaji: "E", color: "bg-green-500" },
  { char: "お", romaji: "O", color: "bg-purple-500" },
]

export function SonicHero() {
  const [activeVowel, setActiveVowel] = useState<string | null>(null)

  const playSound = (romaji: string) => {
    console.log(`Playing audio: ${romaji}`)
    setActiveVowel(romaji)
    setTimeout(() => setActiveVowel(null), 1000)
  }

  return (
    <section className="py-20 text-center">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-bold text-[#1c315e] mb-2"
      >
        Master the Sounds of Japan.
      </motion.h1>
      <p className="text-lg text-gray-600 mb-12">The Soundscape</p>

      <div className="flex flex-wrap justify-center gap-4 md:gap-8 px-4">
        {vowels.map((vowel) => (
          <motion.div
            key={vowel.romaji}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => playSound(vowel.romaji)}
            className={`
              relative w-24 h-32 md:w-32 md:h-40 rounded-xl cursor-pointer 
              bg-white shadow-sm border-2 transition-all duration-300 flex flex-col items-center justify-center
              ${activeVowel === vowel.romaji ? "border-[#227c70] ring-4 ring-[#227c70]/20" : "border-transparent hover:border-[#227c70]"}
            `}
          >
            <span className="text-4xl md:text-5xl font-bold text-[#1c315e] mb-2">{vowel.char}</span>
            <span className="text-lg text-gray-400 font-medium">{vowel.romaji}</span>
            
            {activeVowel === vowel.romaji && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.5 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="absolute -top-3 -right-3 bg-[#227c70] text-white p-1.5 rounded-full shadow-md"
               >
                 <Volume2 className="w-4 h-4" />
               </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
