import React from "react"
import { SonicHero } from "@/components/learn/SonicHero"
import { Phrasebook } from "@/components/learn/Phrasebook"
import { KonbiniPractice } from "@/components/learn/KonbiniPractice"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Japanese Essentials | Azen",
  description: "Master the sounds of Japan and survive your trip with our interactive learning hub.",
}

async function getCollections() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("phrase_collections")
    .select("*")
    .eq("published", true)
    .order("order_index", { ascending: true })
  return data ?? []
}

export default async function LearnPage() {
  const collections = await getCollections()

  return (
    <div className="min-h-screen bg-background pb-16">
      <SonicHero />
      <Phrasebook collections={collections} />
      <KonbiniPractice />
    </div>
  )
}
