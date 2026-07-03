import React from "react"
import { SonicHero } from "@/components/learn/SonicHero"
import { Phrasebook } from "@/components/learn/Phrasebook"
import { KonbiniSimulator } from "@/components/learn/KonbiniSimulator"
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
    <div className="bg-background min-h-screen pb-20">
      <SonicHero />
      <Phrasebook collections={collections} />
      <KonbiniSimulator />
    </div>
  )
}
