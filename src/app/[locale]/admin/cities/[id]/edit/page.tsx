import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CityForm } from "@/components/admin/CityForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCityPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: city } = await supabase.from("cities").select("*").eq("id", id).single()

  if (!city) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">Edit {city.name}</h1>
      <CityForm city={city} />
    </div>
  )
}
