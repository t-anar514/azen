"use client"

import Image from "next/image"
import { Experience } from "@/data/experiences"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

export function ExperienceHero({ experience }: { experience: Experience }) {
  const t = useTranslations(`Experiences.${experience.id}`)
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Badge className="bg-[#88a47c] text-white hover:bg-[#88a47c]/90 border-none px-3 py-1 text-sm font-bold tracking-wide">
          {t('category')}
        </Badge>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1c315e] leading-tight tracking-tighter italic">
          {t('title')}
        </h1>
        <p className="text-xl text-[#1c315e]/70 font-medium">
          {experience.location} • {t('locationName')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 aspect-[21/9] md:aspect-[21/8]">
        <div className="md:col-span-3 relative rounded-2xl overflow-hidden shadow-2xl group">
          <Image
            src={experience.heroImage}
            alt={experience.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4">
          {experience.gallery.slice(1, 3).map((img, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden shadow-lg group">
              <Image
                src={img}
                alt={`${experience.title} gallery ${i}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
