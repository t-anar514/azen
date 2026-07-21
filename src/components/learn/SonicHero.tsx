"use client"

import React, { useState } from "react"
import { Volume2 } from "lucide-react"
import { useTTS } from "@/hooks/use-tts"

const VOWELS = [
  { char: "あ", romaji: "A" },
  { char: "い", romaji: "I" },
  { char: "う", romaji: "U" },
  { char: "え", romaji: "E" },
  { char: "お", romaji: "O" },
]

/**
 * Learn hero band (design doc, Screen 08): big あ mark + eyebrow + title, with
 * the vowel row kept as a tap-to-hear sound primer (TTS preserved).
 */
export function SonicHero() {
  const [active, setActive] = useState<string | null>(null)
  const { speak } = useTTS()

  function play(char: string, romaji: string) {
    speak(char)
    setActive(romaji)
    setTimeout(() => setActive(null), 1000)
  }

  return (
    <section className="mx-auto max-w-content px-4 md:px-6 pt-12">
      <div className="flex flex-col items-center gap-6 rounded-card bg-tint-sky p-8 text-center md:flex-row md:items-center md:gap-10 md:text-left">
        <button
          type="button"
          onClick={() => play("あ", "A")}
          aria-label="あ дуудлага"
          className="flex size-28 shrink-0 items-center justify-center rounded-card bg-card font-display text-6xl font-extrabold text-primary shadow-sm transition-transform hover:scale-105 active:scale-95"
        >
          あ
        </button>
        <div>
          <span className="text-eyebrow">Хэлний хөтөч</span>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Аяны япон хэллэг
          </h1>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Хамгийн хэрэгтэй хэллэгүүдийг дуудлагатай нь сур. Товшоод сонс, давт.
          </p>
        </div>
      </div>

      {/* vowel sound primer */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {VOWELS.map((v) => (
          <button
            key={v.romaji}
            type="button"
            onClick={() => play(v.char, v.romaji)}
            className={`relative flex size-20 flex-col items-center justify-center rounded-thumb border bg-card transition-all ${
              active === v.romaji
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <span className="font-display text-3xl font-bold text-foreground">{v.char}</span>
            <span className="text-xs font-medium text-muted-foreground">{v.romaji}</span>
            {active === v.romaji && (
              <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-white shadow">
                <Volume2 className="size-3.5" />
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
