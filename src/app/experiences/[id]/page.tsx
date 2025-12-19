"use client"

import { useParams, useRouter } from "next/navigation"
import { EXPERIENCES } from "@/data/experiences"
import { ExperienceHero } from "@/components/experiences/ExperienceHero"
import { ExperienceInfoBar } from "@/components/experiences/ExperienceInfoBar"
import { ExperienceStory } from "@/components/experiences/ExperienceStory"
import { BookingCard } from "@/components/experiences/BookingCard"
import { ExperienceMap } from "@/components/experiences/ExperienceMap"
import { GuideProfile } from "@/components/experiences/GuideProfile"
import { ChevronLeft } from "lucide-react"

export default function ExperiencePage() {
  const params = useParams()
  const router = useRouter()
  const experience = EXPERIENCES.find(e => e.id === params.id)

  if (!experience) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Experience not found</h1>
        <button 
          onClick={() => router.push('/')}
          className="text-[#227c70] font-semibold hover:underline"
        >
          Return Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#e6e2c3] pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#1c315e] font-bold uppercase tracking-widest text-xs mb-6 hover:text-[#227c70] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-12">
            <ExperienceHero experience={experience} />
            <ExperienceInfoBar experience={experience} />
            <ExperienceStory experience={experience} />
            
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-[#1c315e] tracking-tight">Your Meeting Point</h2>
                <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-xl border border-white/20">
                    <ExperienceMap meetingPoint={experience.meetingPoint} />
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-black text-[#1c315e] tracking-tight">Your In-Person Guide</h2>
                <GuideProfile guide={experience.guide} />
            </div>
          </div>

          {/* Sidebar / Booking Card (Right) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24">
              <BookingCard experience={experience} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
