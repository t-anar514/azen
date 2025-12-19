"use client"

import { Experience } from "@/data/experiences"
import { CheckCircle2, AlertCircle } from "lucide-react"

export function ExperienceStory({ experience }: { experience: Experience }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-[#1c315e] tracking-tight">The Story</h2>
        <div className="space-y-4">
          {experience.description.map((para, i) => (
            <p key={i} className="text-[#1c315e]/80 leading-relaxed font-medium">
              {para}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        <div className="space-y-4">
          <h3 className="text-lg font-black text-[#1c315e] uppercase tracking-widest text-xs">What&apos;s Included</h3>
          <ul className="grid gap-3">
            {experience.includes.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-[#1c315e]/90 font-semibold shadow-sm bg-white/40 p-3 rounded-xl border border-white/20">
                <CheckCircle2 className="w-5 h-5 text-[#227c70] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black text-[#1c315e] uppercase tracking-widest text-xs">What to Bring</h3>
          <div className="bg-[#88a47c]/10 border border-[#88a47c]/20 p-5 rounded-2xl flex gap-4">
             <AlertCircle className="w-5 h-5 text-[#88a47c] shrink-0" />
             <ul className="text-sm font-bold text-[#1c315e]/70 space-y-2">
                {experience.toBring.map((item, i) => (
                    <li key={i}>• {item}</li>
                ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
