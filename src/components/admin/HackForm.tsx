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
import type { HackCategory, HackRow, HackStepRow } from "@/lib/supabase/types"

const CATEGORIES: HackCategory[] = [
  "Food",
  "Transport",
  "Money",
  "Logistics",
  "Etiquette",
  "Tourist Trap",
]

type FormState = {
  id: string
  title: string
  category: HackCategory
  summary: string
  cover_image: string
  pro_tip: string
  trap_alternative: string
  related_ids: string
  published: boolean
  order_index: number
  steps: HackStepRow[]
}

function toFormState(hack?: HackRow | null): FormState {
  return {
    id: hack?.id ?? "",
    title: hack?.title ?? "",
    category: hack?.category ?? "Food",
    summary: hack?.summary ?? "",
    cover_image: hack?.cover_image ?? "",
    pro_tip: hack?.pro_tip ?? "",
    trap_alternative: hack?.trap_alternative ?? "",
    related_ids: hack?.related_ids?.join(", ") ?? "",
    published: hack?.published ?? false,
    order_index: hack?.order_index ?? 0,
    steps: hack?.steps ?? [],
  }
}

interface HackFormProps {
  hack?: HackRow | null
}

export function HackForm({ hack }: HackFormProps) {
  const router = useRouter()
  const isEditing = !!hack
  const [form, setForm] = React.useState<FormState>(() => toFormState(hack))
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
      summary: form.summary || null,
      cover_image: form.cover_image || null,
      pro_tip: form.pro_tip || null,
      trap_alternative: form.category === "Tourist Trap" ? form.trap_alternative || null : null,
      related_ids: form.related_ids
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      steps: form.steps.map((s, i) => ({ ...s, step: i + 1 })),
    }

    try {
      const res = await fetch(
        isEditing ? `/api/admin/hacks/${hack!.id}` : "/api/admin/hacks",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || "Failed to save hack.")
      }

      router.push("/admin/hacks")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save hack.")
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
                placeholder="suica-card"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => update("category", e.target.value as HackCategory)}
              className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <ImageUploadField
            label="Cover image"
            folder="azen/hacks"
            value={form.cover_image}
            onChange={(url) => update("cover_image", url)}
          />

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              rows={3}
              value={form.summary}
              onChange={(e) => update("summary", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pro_tip">Pro tip</Label>
            <Textarea
              id="pro_tip"
              rows={2}
              value={form.pro_tip}
              onChange={(e) => update("pro_tip", e.target.value)}
            />
          </div>

          {form.category === "Tourist Trap" && (
            <div className="space-y-2">
              <Label htmlFor="trap_alternative">Trap alternative</Label>
              <Textarea
                id="trap_alternative"
                rows={2}
                value={form.trap_alternative}
                onChange={(e) => update("trap_alternative", e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="related_ids">Related hack IDs (comma-separated)</Label>
            <Input
              id="related_ids"
              value={form.related_ids}
              onChange={(e) => update("related_ids", e.target.value)}
              placeholder="convenience-stores, train-etiquette"
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
              <Label htmlFor="published">Published</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.steps.map((step, i) => (
            <Card key={i} className="bg-secondary/5">
              <CardContent className="space-y-2 pt-6">
                <p className="text-xs font-medium text-muted-foreground">Step {i + 1}</p>
                <Input
                  placeholder="Step title"
                  value={step.title}
                  onChange={(e) => {
                    const steps = [...form.steps]
                    steps[i] = { ...steps[i], title: e.target.value }
                    update("steps", steps)
                  }}
                />
                <Textarea
                  placeholder="Step text"
                  value={step.text}
                  onChange={(e) => {
                    const steps = [...form.steps]
                    steps[i] = { ...steps[i], text: e.target.value }
                    update("steps", steps)
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => update("steps", form.steps.filter((_, idx) => idx !== i))}
                >
                  Remove step
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update("steps", [
                ...form.steps,
                { step: form.steps.length + 1, title: "", text: "" },
              ])
            }
          >
            + Add step
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create hack"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/hacks")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
