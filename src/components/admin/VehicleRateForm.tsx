"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { formatTransferPrice } from "@/lib/transfers/format"
import type { VehicleOptionRow } from "@/lib/supabase/types"

// The distance the formula preview is evaluated at, so an admin can see what a
// per-km change does to a real fare (the flagship Narita → central Tokyo run).
const REFERENCE_KM = 68

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step
}

interface VehicleRowProps {
  vehicle: VehicleOptionRow
}

function VehicleRow({ vehicle }: VehicleRowProps) {
  const router = useRouter()
  const [name, setName] = React.useState(vehicle.name)
  const [capacity, setCapacity] = React.useState(String(vehicle.capacity))
  const [price, setPrice] = React.useState(String(vehicle.price))
  const [baseFare, setBaseFare] = React.useState(String(vehicle.base_fare))
  const [pricePerKm, setPricePerKm] = React.useState(String(vehicle.price_per_km))
  const [isActive, setIsActive] = React.useState(vehicle.is_active)

  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  const previewPrice = roundToStep(
    (Number(baseFare) || 0) + (Number(pricePerKm) || 0) * REFERENCE_KM,
    500
  )

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch(`/api/admin/vehicle-options/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          capacity: Number(capacity),
          price: Number(price),
          base_fare: Number(baseFare),
          price_per_km: Number(pricePerKm),
          is_active: isActive,
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || "Failed to save vehicle.")
      }

      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vehicle.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs text-muted-foreground">{vehicle.id}</p>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`active-${vehicle.id}`}
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label htmlFor={`active-${vehicle.id}`} className="text-xs">
              Active
            </Label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`name-${vehicle.id}`}>Name</Label>
            <Input id={`name-${vehicle.id}`} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`capacity-${vehicle.id}`}>Capacity (passengers)</Label>
            <Input
              id={`capacity-${vehicle.id}`}
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor={`base-${vehicle.id}`}>Base fare (¥)</Label>
            <Input
              id={`base-${vehicle.id}`}
              type="number"
              min="0"
              value={baseFare}
              onChange={(e) => setBaseFare(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`perkm-${vehicle.id}`}>Price / km (¥)</Label>
            <Input
              id={`perkm-${vehicle.id}`}
              type="number"
              min="0"
              value={pricePerKm}
              onChange={(e) => setPricePerKm(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`flat-${vehicle.id}`}>Flat starting price (¥)</Label>
            <Input
              id={`flat-${vehicle.id}`}
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Formula = base fare + price/km × distance. Example at {REFERENCE_KM} km ={" "}
          <span className="font-semibold text-foreground">{formatTransferPrice(previewPrice, "JPY")}</span>.
          The flat price is shown before a destination is picked and used for unlisted addresses with
          no distance.
        </p>

        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          {saved && <span className="text-sm text-primary">Saved ✓</span>}
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

interface VehicleRateFormProps {
  vehicles: VehicleOptionRow[]
}

export function VehicleRateForm({ vehicles }: VehicleRateFormProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {vehicles.map((vehicle) => (
        <VehicleRow key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  )
}
