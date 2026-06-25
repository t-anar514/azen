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
import type { CityDistrict, CityRow, CitySeason, CityTier } from "@/lib/supabase/types"

type FormState = {
  id: string
  name: string
  hero_image: string
  teaser: string
  introduction: string
  getting_around: string
  published: boolean
  order_index: number
  history: { text: string; imageUrl: string }
  culture: { text: string; imageUrl: string }
  vibe: { text: string; imageUrl: string }
  expenses: { text: string; imageUrl: string; tiers: CityTier[] }
  climate: { text: string; imageUrl: string; seasons: CitySeason[] }
  districts: { mapUrl: string; list: CityDistrict[] }
}

function toFormState(city?: CityRow | null): FormState {
  return {
    id: city?.id ?? "",
    name: city?.name ?? "",
    hero_image: city?.hero_image ?? "",
    teaser: city?.teaser ?? "",
    introduction: city?.introduction ?? "",
    getting_around: city?.getting_around ?? "",
    published: city?.published ?? false,
    order_index: city?.order_index ?? 0,
    history: { text: city?.history?.text ?? "", imageUrl: city?.history?.imageUrl ?? "" },
    culture: { text: city?.culture?.text ?? "", imageUrl: city?.culture?.imageUrl ?? "" },
    vibe: { text: city?.vibe?.text ?? "", imageUrl: city?.vibe?.imageUrl ?? "" },
    expenses: {
      text: city?.expenses?.text ?? "",
      imageUrl: city?.expenses?.imageUrl ?? "",
      tiers: city?.expenses?.tiers ?? [],
    },
    climate: {
      text: city?.climate?.text ?? "",
      imageUrl: city?.climate?.imageUrl ?? "",
      seasons: city?.climate?.seasons ?? [],
    },
    districts: {
      mapUrl: city?.districts?.mapUrl ?? "",
      list: city?.districts?.list ?? [],
    },
  }
}

interface CityFormProps {
  city?: CityRow | null
}

export function CityForm({ city }: CityFormProps) {
  const router = useRouter()
  const isEditing = !!city
  const [form, setForm] = React.useState<FormState>(() => toFormState(city))
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateNested<K extends "history" | "culture" | "vibe" | "expenses" | "climate" | "districts">(
    key: K,
    patch: Partial<FormState[K]>
  ) {
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      hero_image: form.hero_image || null,
      teaser: form.teaser || null,
      introduction: form.introduction || null,
      getting_around: form.getting_around || null,
    }

    try {
      const res = await fetch(
        isEditing ? `/api/admin/cities/${city!.id}` : "/api/admin/cities",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || "Failed to save city.")
      }

      router.push("/admin/cities")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save city.")
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
              <Label htmlFor="id">Slug / ID</Label>
              <Input
                id="id"
                value={form.id}
                disabled={isEditing}
                onChange={(e) => update("id", e.target.value)}
                placeholder="tokyo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Tokyo"
                required
              />
            </div>
          </div>

          <ImageUploadField
            label="Hero image"
            folder="azen/cities"
            value={form.hero_image}
            onChange={(url) => update("hero_image", url)}
          />

          <div className="space-y-2">
            <Label htmlFor="teaser">Teaser</Label>
            <Textarea
              id="teaser"
              value={form.teaser}
              onChange={(e) => update("teaser", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="introduction">Introduction</Label>
            <Textarea
              id="introduction"
              rows={4}
              value={form.introduction}
              onChange={(e) => update("introduction", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="getting_around">Getting around</Label>
            <Textarea
              id="getting_around"
              rows={3}
              value={form.getting_around}
              onChange={(e) => update("getting_around", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order_index">Order index</Label>
              <Input
                id="order_index"
                type="number"
                value={form.order_index}
                onChange={(e) => update("order_index", Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="published"
                checked={form.published}
                onCheckedChange={(checked) => update("published", checked === true)}
              />
              <Label htmlFor="published">Published (visible on the public site)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={4}
            value={form.history.text}
            onChange={(e) => updateNested("history", { text: e.target.value })}
            placeholder="History text"
          />
          <ImageUploadField
            label="History image"
            folder="azen/cities"
            value={form.history.imageUrl}
            onChange={(url) => updateNested("history", { imageUrl: url })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Culture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={4}
            value={form.culture.text}
            onChange={(e) => updateNested("culture", { text: e.target.value })}
            placeholder="Culture text"
          />
          <ImageUploadField
            label="Culture image"
            folder="azen/cities"
            value={form.culture.imageUrl}
            onChange={(url) => updateNested("culture", { imageUrl: url })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vibe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={4}
            value={form.vibe.text}
            onChange={(e) => updateNested("vibe", { text: e.target.value })}
            placeholder="Vibe text"
          />
          <ImageUploadField
            label="Vibe image"
            folder="azen/cities"
            value={form.vibe.imageUrl}
            onChange={(url) => updateNested("vibe", { imageUrl: url })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={3}
            value={form.expenses.text}
            onChange={(e) => updateNested("expenses", { text: e.target.value })}
            placeholder="Expenses overview text"
          />
          <ImageUploadField
            label="Expenses image"
            folder="azen/cities"
            value={form.expenses.imageUrl}
            onChange={(url) => updateNested("expenses", { imageUrl: url })}
          />

          <div className="space-y-3">
            <Label>Price tiers</Label>
            {form.expenses.tiers.map((tier, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Category (e.g. Budget hostel)"
                  value={tier.category}
                  onChange={(e) => {
                    const tiers = [...form.expenses.tiers]
                    tiers[i] = { ...tiers[i], category: e.target.value }
                    updateNested("expenses", { tiers })
                  }}
                />
                <Input
                  placeholder="Amount (e.g. ¥2,000–4,000/night)"
                  value={tier.amount}
                  onChange={(e) => {
                    const tiers = [...form.expenses.tiers]
                    tiers[i] = { ...tiers[i], amount: e.target.value }
                    updateNested("expenses", { tiers })
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const tiers = form.expenses.tiers.filter((_, idx) => idx !== i)
                    updateNested("expenses", { tiers })
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateNested("expenses", {
                  tiers: [...form.expenses.tiers, { category: "", amount: "" }],
                })
              }
            >
              + Add tier
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Climate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={3}
            value={form.climate.text}
            onChange={(e) => updateNested("climate", { text: e.target.value })}
            placeholder="Climate overview text"
          />
          <ImageUploadField
            label="Climate image"
            folder="azen/cities"
            value={form.climate.imageUrl}
            onChange={(url) => updateNested("climate", { imageUrl: url })}
          />

          <div className="space-y-3">
            <Label>Seasons</Label>
            {form.climate.seasons.map((season, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Season name"
                  value={season.name}
                  onChange={(e) => {
                    const seasons = [...form.climate.seasons]
                    seasons[i] = { ...seasons[i], name: e.target.value }
                    updateNested("climate", { seasons })
                  }}
                />
                <Input
                  placeholder="Temp (e.g. 5–12°C)"
                  value={season.temp}
                  onChange={(e) => {
                    const seasons = [...form.climate.seasons]
                    seasons[i] = { ...seasons[i], temp: e.target.value }
                    updateNested("climate", { seasons })
                  }}
                />
                <Input
                  placeholder="Vibe (e.g. Cherry blossoms)"
                  value={season.vibe}
                  onChange={(e) => {
                    const seasons = [...form.climate.seasons]
                    seasons[i] = { ...seasons[i], vibe: e.target.value }
                    updateNested("climate", { seasons })
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const seasons = form.climate.seasons.filter((_, idx) => idx !== i)
                    updateNested("climate", { seasons })
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateNested("climate", {
                  seasons: [...form.climate.seasons, { name: "", temp: "", vibe: "" }],
                })
              }
            >
              + Add season
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Districts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapUrl">Map embed URL</Label>
            <Input
              id="mapUrl"
              value={form.districts.mapUrl}
              onChange={(e) => updateNested("districts", { mapUrl: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <Label>District list</Label>
            {form.districts.list.map((district, i) => (
              <Card key={i} className="bg-secondary/5">
                <CardContent className="space-y-2 pt-6">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="ID (e.g. shibuya)"
                      value={district.id}
                      onChange={(e) => {
                        const list = [...form.districts.list]
                        list[i] = { ...list[i], id: e.target.value }
                        updateNested("districts", { list })
                      }}
                    />
                    <Input
                      placeholder="Name"
                      value={district.name}
                      onChange={(e) => {
                        const list = [...form.districts.list]
                        list[i] = { ...list[i], name: e.target.value }
                        updateNested("districts", { list })
                      }}
                    />
                  </div>
                  <Input
                    placeholder="Category"
                    value={district.category}
                    onChange={(e) => {
                      const list = [...form.districts.list]
                      list[i] = { ...list[i], category: e.target.value }
                      updateNested("districts", { list })
                    }}
                  />
                  <Textarea
                    placeholder="Description"
                    value={district.description}
                    onChange={(e) => {
                      const list = [...form.districts.list]
                      list[i] = { ...list[i], description: e.target.value }
                      updateNested("districts", { list })
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const list = form.districts.list.filter((_, idx) => idx !== i)
                      updateNested("districts", { list })
                    }}
                  >
                    Remove district
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateNested("districts", {
                  list: [
                    ...form.districts.list,
                    { id: "", name: "", description: "", category: "" },
                  ],
                })
              }
            >
              + Add district
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create city"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/cities")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
