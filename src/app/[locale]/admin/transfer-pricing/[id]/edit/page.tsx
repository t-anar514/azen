import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TransferZoneForm } from "@/components/admin/TransferZoneForm"
import type { RoutePriceRow, VehicleOptionRow } from "@/lib/supabase/types"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTransferZonePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: zone }, { data: routePrices }, { data: vehicles }] = await Promise.all([
    supabase.from("transfer_zones").select("*").eq("id", id).single(),
    supabase.from("route_prices").select("*").eq("zone_id", id),
    supabase.from("vehicle_options").select("*").eq("is_active", true).order("order_index"),
  ])

  if (!zone) notFound()

  const initialPrices: Record<string, number> = {}
  for (const rp of (routePrices ?? []) as RoutePriceRow[]) {
    initialPrices[rp.vehicle_option_id] = rp.price
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">Edit {zone.label}</h1>
      <TransferZoneForm
        zone={zone}
        vehicles={(vehicles ?? []) as VehicleOptionRow[]}
        initialPrices={initialPrices}
      />
    </div>
  )
}
