import { createClient } from "@/lib/supabase/server"
import { PlaceForm } from "@/components/admin/PlaceForm"

export default async function NewPlacePage() {
  const supabase = await createClient()
  const { data: cities } = await supabase.from("cities").select("id, name").order("order_index")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">New place</h1>
      <PlaceForm cities={cities ?? []} />
    </div>
  )
}
