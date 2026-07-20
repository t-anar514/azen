"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUploadField } from "@/components/admin/ImageUploadField"
import { slugify } from "@/lib/slugify"
import type { PlaceCategory, PlaceRow } from "@/lib/supabase/types"

const CATEGORIES: PlaceCategory[] = [
  "things_to_do",
  "places_to_eat",
  "nightlife",
  "shopping",
  "day_trip",
]

const selectClass =
  "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none"

type FormState = {
  city_id: string
  slug: string
  name: string
  category: PlaceCategory
  subcategory: string
  neighborhood: string
  lat: string
  lng: string
  address: string
  cover_image: string
  short_desc: string
  long_desc: string
  price_band: string
  booking_url: string
  tags: string
  is_hidden_gem: boolean
  published: boolean
  order_index: number
}

function toFormState(place?: PlaceRow | null, defaultCity?: string): FormState {
  return {
    city_id: place?.city_id ?? defaultCity ?? "",
    slug: place?.slug ?? "",
    name: place?.name ?? "",
    category: place?.category ?? "things_to_do",
    subcategory: place?.subcategory ?? "",
    neighborhood: place?.neighborhood ?? "",
    lat: place?.lat?.toString() ?? "",
    lng: place?.lng?.toString() ?? "",
    address: place?.address ?? "",
    cover_image: place?.cover_image ?? "",
    short_desc: place?.short_desc ?? "",
    long_desc: place?.long_desc ?? "",
    price_band: place?.price_band?.toString() ?? "",
    booking_url: place?.booking_url ?? "",
    tags: place?.tags?.join(", ") ?? "",
    is_hidden_gem: place?.is_hidden_gem ?? false,
    published: place?.published ?? true,
    order_index: place?.order_index ?? 0,
  }
}

interface PlaceFormProps {
  place?: PlaceRow | null
  cities: { id: string; name: string }[]
}

export function PlaceForm({ place, cities }: PlaceFormProps) {
  const router = useRouter()
  const isEditing = !!place
  const [form, setForm] = React.useState<FormState>(() =>
    toFormState(place, cities[0]?.id)
  )
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
      city_id: form.city_id,
      slug: form.slug ? slugify(form.slug) : slugify(form.name),
      name: form.name,
      category: form.category,
      subcategory: form.subcategory || null,
      neighborhood: form.neighborhood || null,
      lat: form.lat === "" ? null : Number(form.lat),
      lng: form.lng === "" ? null : Number(form.lng),
      address: form.address || null,
      cover_image: form.cover_image || null,
      short_desc: form.short_desc || null,
      long_desc: form.long_desc || null,
      price_band: form.price_band === "" ? null : Number(form.price_band),
      booking_url: form.booking_url || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_hidden_gem: form.is_hidden_gem,
      published: form.published,
      order_index: form.order_index,
    }

    try {
      const res = await fetch(
        isEditing ? `/api/admin/places/${place!.id}` : "/api/admin/places",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? `Request failed (${res.status})`)
      }
      router.push("/admin/places")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save place.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city_id">City</Label>
              <select
                id="city_id"
                value={form.city_id}
                onChange={(e) => update("city_id", e.target.value)}
                className={selectClass}
                required
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => update("category", e.target.value as PlaceCategory)}
                className={selectClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Golden Gai"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (auto from name if empty)</Label>
              <Input
                id="slug"
                value={form.slug}
                disabled={isEditing}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="golden-gai"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={form.subcategory}
                onChange={(e) => update("subcategory", e.target.value)}
                placeholder="Casual Eats, Museums, Ramen…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Input
                id="neighborhood"
                value={form.neighborhood}
                onChange={(e) => update("neighborhood", e.target.value)}
                placeholder="Shinjuku"
              />
            </div>
          </div>

          <ImageUploadField
            label="Cover image"
            folder="azen/places"
            value={form.cover_image}
            onChange={(url) => update("cover_image", url)}
          />

          <div className="space-y-2">
            <Label htmlFor="short_desc">Short description (card text)</Label>
            <Textarea
              id="short_desc"
              value={form.short_desc}
              onChange={(e) => update("short_desc", e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="long_desc">Long description (detail page)</Label>
            <Textarea
              id="long_desc"
              value={form.long_desc}
              onChange={(e) => update("long_desc", e.target.value)}
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location & details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                value={form.lat}
                onChange={(e) => update("lat", e.target.value)}
                placeholder="35.6938"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                value={form.lng}
                onChange={(e) => update("lng", e.target.value)}
                placeholder="139.7034"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_band">Price band (1–4)</Label>
              <select
                id="price_band"
                value={form.price_band}
                onChange={(e) => update("price_band", e.target.value)}
                className={selectClass}
              >
                <option value="">—</option>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {"¥".repeat(n)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="booking_url">Booking URL</Label>
              <Input
                id="booking_url"
                value={form.booking_url}
                onChange={(e) => update("booking_url", e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                placeholder="ramen, late-night, cash-only"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.is_hidden_gem}
                onCheckedChange={(v) => update("is_hidden_gem", v === true)}
              />
              Hidden gem
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.published}
                onCheckedChange={(v) => update("published", v === true)}
              />
              Published
            </label>
            <div className="flex items-center gap-2 text-sm">
              <Label htmlFor="order_index">Order</Label>
              <Input
                id="order_index"
                type="number"
                className="w-20"
                value={form.order_index}
                onChange={(e) => update("order_index", Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" variant="reserve" disabled={saving}>
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create place"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/places")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
