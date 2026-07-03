import { createClient } from "@/lib/supabase/server"
import { TransferZoneForm } from "@/components/admin/TransferZoneForm"
import type { VehicleOptionRow } from "@/lib/supabase/types"

export default async function NewTransferZonePage() {
  const supabase = await createClient()
  const { data: vehicles } = await supabase
    .from("vehicle_options")
    .select("*")
    .eq("is_active", true)
    .order("order_index")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">New destination zone</h1>
      <TransferZoneForm vehicles={(vehicles ?? []) as VehicleOptionRow[]} />
    </div>
  )
}
