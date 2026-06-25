"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FlightDealRow } from "@/lib/supabase/types"

type FormState = {
  origin_city: string
  origin_code: string
  destination_city: string
  destination_code: string
  airline: string
  price: string
  currency: string
  depart_date: string
  return_date: string
  deal_url: string
  source: string
  is_active: boolean
  order_index: number
}

function toFormState(deal?: FlightDealRow | null): FormState {
  return {
    origin_city: deal?.origin_city ?? "",
    origin_code: deal?.origin_code ?? "",
    destination_city: deal?.destination_city ?? "Tokyo",
    destination_code: deal?.destination_code ?? "",
    airline: deal?.airline ?? "",
    price: deal?.price != null ? String(deal.price) : "",
    currency: deal?.currency ?? "MNT",
    depart_date: deal?.depart_date ?? "",
    return_date: deal?.return_date ?? "",
    deal_url: deal?.deal_url ?? "",
    source: deal?.source ?? "",
    is_active: deal?.is_active ?? true,
    order_index: deal?.order_index ?? 0,
  }
}

interface FlightDealFormProps {
  deal?: FlightDealRow | null
}

export function FlightDealForm({ deal }: FlightDealFormProps) {
  const router = useRouter()
  const isEditing = !!deal
  const [form, setForm] = React.useState<FormState>(() => toFormState(deal))
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      origin_code: form.origin_code || null,
      destination_code: form.destination_code || null,
      airline: form.airline || null,
      price: form.price ? Number(form.price) : null,
      depart_date: form.depart_date || null,
      return_date: form.return_date || null,
      source: form.source || null,
    }

    try {
      const res = await fetch(isEditing ? `/api/admin/flights/${deal!.id}` : "/api/admin/flights", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || "Failed to save flight deal.")
      }

      router.push("/admin/flights")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save flight deal.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Route</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="origin_city">Origin city</Label>
              <Input
                id="origin_city"
                value={form.origin_city}
                onChange={(e) => update("origin_city", e.target.value)}
                placeholder="Ulaanbaatar"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin_code">Origin airport code</Label>
              <Input
                id="origin_code"
                value={form.origin_code}
                onChange={(e) => update("origin_code", e.target.value)}
                placeholder="UBN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_city">Destination city</Label>
              <Input
                id="destination_city"
                value={form.destination_city}
                onChange={(e) => update("destination_city", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_code">Destination airport code</Label>
              <Input
                id="destination_code"
                value={form.destination_code}
                onChange={(e) => update("destination_code", e.target.value)}
                placeholder="NRT"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="airline">Airline</Label>
            <Input id="airline" value={form.airline} onChange={(e) => update("airline", e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value={form.currency} onChange={(e) => update("currency", e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="depart_date">Depart date</Label>
              <Input
                id="depart_date"
                type="date"
                value={form.depart_date}
                onChange={(e) => update("depart_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return_date">Return date</Label>
              <Input
                id="return_date"
                type="date"
                value={form.return_date}
                onChange={(e) => update("return_date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal_url">Booking link (where the customer buys the ticket)</Label>
            <Input
              id="deal_url"
              value={form.deal_url}
              onChange={(e) => update("deal_url", e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source note</Label>
            <Input
              id="source"
              value={form.source}
              onChange={(e) => update("source", e.target.value)}
              placeholder="e.g. manually curated, or scraper name once live"
            />
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
              <Label htmlFor="is_active">Active (visible on /flights)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create deal"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/flights")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
