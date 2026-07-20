import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PlaceForm } from "@/components/admin/PlaceForm"
import { PlaceRecsEditor } from "@/components/admin/PlaceRecsEditor"
import type { PlaceRow } from "@/lib/supabase/types"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPlacePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [placeRes, citiesRes, guidesRes] = await Promise.all([
    supabase.from("places").select("*").eq("id", id).single<PlaceRow>(),
    supabase.from("cities").select("id, name").order("order_index"),
    supabase.from("guides").select("id, name").order("name"),
  ])

  const place = placeRes.data
  if (!place) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">Edit {place.name}</h1>
      <PlaceForm place={place} cities={citiesRes.data ?? []} />
      <PlaceRecsEditor placeId={place.id} guides={guidesRes.data ?? []} />
    </div>
  )
}
