import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { VehicleOptionRow } from "@/lib/supabase/types"

export async function getActiveVehicleOptions(): Promise<VehicleOptionRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("vehicle_options")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true })

  return data ?? []
}
