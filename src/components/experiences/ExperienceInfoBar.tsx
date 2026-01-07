"use client"

import { Experience } from "@/data/experiences"
import { Clock, Users, Globe, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"

export function ExperienceInfoBar({ experience }: { experience: Experience }) {
  const tExp = useTranslations(`Experiences.${experience.id}`)
  const tDetail = useTranslations("ExperienceDetail")

  const items = [
    { icon: <Clock className="w-5 h-5 text-[#227c70]" />, label: experience.duration },
    { icon: <Users className="w-5 h-5 text-[#227c70]" />, label: `${tDetail('groupSize')}: ${experience.maxGroupSize}` },
    { icon: <Globe className="w-5 h-5 text-[#227c70]" />, label: experience.languages.join(" / ") },
    { icon: <MapPin className="w-5 h-5 text-[#227c70]" />, label: tExp('meetingPoint.name') },
  ]

  return (
    <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-3xl p-6 md:p-8 flex flex-wrap gap-8 md:gap-12 shadow-sm">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            {item.icon}
          </div>
          <div className="text-[#1c315e] font-bold text-sm uppercase tracking-widest leading-none">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
