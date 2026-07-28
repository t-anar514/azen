"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AIRPORTS } from "@/lib/transfers/airports"
import { formatTransferPrice } from "@/lib/transfers/format"
import type { TransferZoneRow, VehicleOptionRow } from "@/lib/supabase/types"

type FormState = {
  airport_code: string
  label: string
  distance_km: string
  is_active: boolean
  order_index: number
  prices: Record<string, string> // vehicle_option_id -> price string, "" = use formula
}

function toFormState(zone: TransferZoneRow | null | undefined, initialPrices: Record<string, number>): FormState {
  const prices: Record<string, string> = {}
  for (const [vehicleId, price] of Object.entries(initialPrices)) {
    prices[vehicleId] = String(price)
  }

  return {
    airport_code: zone?.airport_code ?? AIRPORTS[0]?.code ?? "",
    label: zone?.label ?? "",
    distance_km: zone?.distance_km != null ? String(zone.distance_km) : "",
    is_active: zone?.is_active ?? true,
    order_index: zone?.order_index ?? 0,
    prices,
  }
}

interface TransferZoneFormProps {
  zone?: TransferZoneRow | null
  vehicles: VehicleOptionRow[]
  initialPrices?: Record<string, number>
}

export function TransferZoneForm({ zone, vehicles, initialPrices = {} }: TransferZoneFormProps) {
  const router = useRouter()
  const isEditing = !!zone
  const [form, setForm] = React.useState<FormState>(() => toFormState(zone, initialPrices))
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updatePrice(vehicleId: string, value: string) {
    setForm((prev) => ({ ...prev, prices: { ...prev.prices, [vehicleId]: value } }))
  }

  const distanceKm = Number(form.distance_km) || 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const prices: Record<string, number | null> = {}
    for (const vehicle of vehicles) {
      const raw = form.prices[vehicle.id]
      prices[vehicle.id] = raw && raw.trim() !== "" ? Number(raw) : null
    }

    const payload = {
      airport_code: form.airport_code,
      label: form.label,
      distance_km: distanceKm,
      is_active: form.is_active,
      order_index: form.order_index,
      prices,
    }

    try {
      const res = await fetch(isEditing ? `/api/admin/transfer-zones/${zone!.id}` : "/api/admin/transfer-zones", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || "Failed to save destination zone.")
      }

      router.push("/admin/transfer-pricing")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save destination zone.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="airport_code">Pickup airport</Label>
              <select
                id="airport_code"
                value={form.airport_code}
                onChange={(e) => update("airport_code", e.target.value)}
                className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none"
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance_km">Approx. distance (km)</Label>
              <Input
                id="distance_km"
                type="number"
                min="0"
                step="0.1"
                value={form.distance_km}
                onChange={(e) => update("distance_km", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Destination label</Label>
            <Input
              id="label"
              value={form.label}
              onChange={(e) => update("label", e.target.value)}
              placeholder="Tokyo — Shinjuku / Shibuya (central)"
              required
            />
            <p className="text-xs text-muted-foreground">
              Shown to guests in the destination dropdown on /transfer, and stored as the booking&apos;s
              dropoff_location text.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order_index">Order</Label>
              <Input
                id="order_index"
                type="number"
                value={form.order_index}
                onChange={(e) => update("order_index", Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => update("is_active", checked === true)}
              />
              <Label htmlFor="is_active">Active (selectable on /transfer)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prices per vehicle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Leave a field blank to use that vehicle&apos;s formula price (base fare + per-km rate ×{" "}
            {distanceKm || "…"} km). Fill one in to override it with an exact curated price.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {vehicles.map((vehicle) => {
              const formulaPrice = Math.round(
                (vehicle.base_fare + vehicle.price_per_km * distanceKm) / 500
              ) * 500
              return (
                <div key={vehicle.id} className="space-y-2">
                  <Label htmlFor={`price-${vehicle.id}`}>{vehicle.name}</Label>
                  <Input
                    id={`price-${vehicle.id}`}
                    type="number"
                    min="0"
                    placeholder={`Formula: ${formatTransferPrice(formulaPrice, vehicle.currency)}`}
                    value={form.prices[vehicle.id] ?? ""}
                    onChange={(e) => updatePrice(vehicle.id, e.target.value)}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create zone"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/transfer-pricing")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
