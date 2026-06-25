import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FlightDealForm } from "@/components/admin/FlightDealForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditFlightDealPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: deal } = await supabase.from("flight_deals").select("*").eq("id", id).single()

  if (!deal) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">
        Edit {deal.origin_city} → {deal.destination_city}
      </h1>
      <FlightDealForm deal={deal} />
    </div>
  )
}
