import React from "react"
import { SonicHero } from "@/components/learn/SonicHero"
import { Phrasebook } from "@/components/learn/Phrasebook"
import { KonbiniSimulator } from "@/components/learn/KonbiniSimulator"

export const metadata = {
  title: "Japanese Essentials | Azen",
  description: "Master the sounds of Japan and survive your trip with our interactive learning hub.",
}

export default function LearnPage() {
  return (
    <div className="bg-[#e6e2c3] min-h-screen pb-20">
      <SonicHero />
      <Phrasebook />
      <KonbiniSimulator />
    </div>
  )
}
