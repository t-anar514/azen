import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DriverRowActions } from "@/components/admin/DriverRowActions"
import type { DriverRow } from "@/lib/supabase/types"

async function getDrivers(): Promise<DriverRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("drivers")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

const STATUS_VARIANT: Record<DriverRow["verification_status"], "secondary" | "outline" | "destructive"> = {
  pending: "outline",
  approved: "secondary",
  rejected: "destructive",
}

export default async function AdminDriversPage() {
  const drivers = await getDrivers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase italic tracking-tight">Drivers</h1>
        <p className="text-muted-foreground">
          Review applications from /driver/apply. Approving promotes the user&apos;s account to
          the driver role automatically.
        </p>
      </div>

      {drivers.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">No driver applications yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {drivers.map((driver) => (
            <Card key={driver.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div className="space-y-1">
                  <p className="font-semibold">
                    {driver.full_name}{" "}
                    <Badge variant={STATUS_VARIANT[driver.verification_status]} className="ml-1">
                      {driver.verification_status}
                    </Badge>
                    {driver.verification_status === "approved" && (
                      <Badge variant="outline" className="ml-1">
                        {driver.is_available ? "available" : "unavailable"}
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {driver.phone} · License {driver.license_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {driver.vehicle_make} {driver.vehicle_model} · {driver.vehicle_plate}
                  </p>
                  <div className="flex gap-3 text-xs">
                    {driver.id_document_url && (
                      <a href={driver.id_document_url} target="_blank" rel="noreferrer" className="text-primary underline">
                        ID doc
                      </a>
                    )}
                    {driver.license_document_url && (
                      <a href={driver.license_document_url} target="_blank" rel="noreferrer" className="text-primary underline">
                        License doc
                      </a>
                    )}
                    {driver.vehicle_document_url && (
                      <a href={driver.vehicle_document_url} target="_blank" rel="noreferrer" className="text-primary underline">
                        Vehicle doc
                      </a>
                    )}
                  </div>
                </div>
                <DriverRowActions
                  id={driver.id}
                  status={driver.verification_status}
                  isAvailable={driver.is_available}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
