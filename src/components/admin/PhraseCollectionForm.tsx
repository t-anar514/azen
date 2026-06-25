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
import type { PhraseCollectionRow, PhraseRow } from "@/lib/supabase/types"

type FormState = {
  id: string
  title: string
  description: string
  cover_image: string
  published: boolean
  order_index: number
  phrases: PhraseRow[]
}

function toFormState(collection?: PhraseCollectionRow | null): FormState {
  return {
    id: collection?.id ?? "",
    title: collection?.title ?? "",
    description: collection?.description ?? "",
    cover_image: collection?.cover_image ?? "",
    published: collection?.published ?? false,
    order_index: collection?.order_index ?? 0,
    phrases: collection?.phrases ?? [],
  }
}

interface PhraseCollectionFormProps {
  collection?: PhraseCollectionRow | null
}

export function PhraseCollectionForm({ collection }: PhraseCollectionFormProps) {
  const router = useRouter()
  const isEditing = !!collection
  const [form, setForm] = React.useState<FormState>(() => toFormState(collection))
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [generating, setGenerating] = React.useState<Record<number, boolean>>({})
  const [audioErrors, setAudioErrors] = React.useState<Record<number, string>>({})

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updatePhrase(i: number, patch: Partial<PhraseRow>) {
    const phrases = [...form.phrases]
    phrases[i] = { ...phrases[i], ...patch }
    update("phrases", phrases)
  }

  // Generates a natural-sounding VOICEVOX recording for one phrase and stores
  // the resulting Cloudinary URL on it. Runs once here, at content-creation
  // time, so the public /learn page never has to synthesize on the fly.
  async function generateAudio(i: number) {
    const phrase = form.phrases[i]
    if (!phrase?.japanese.trim()) return

    setGenerating((prev) => ({ ...prev, [i]: true }))
    setAudioErrors((prev) => ({ ...prev, [i]: "" }))

    try {
      const res = await fetch("/api/admin/learn/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: phrase.japanese }),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok) throw new Error(json?.error || "Failed to generate audio.")

      updatePhrase(i, { audio_url: json.url })
    } catch (err) {
      setAudioErrors((prev) => ({
        ...prev,
        [i]: err instanceof Error ? err.message : "Failed to generate audio.",
      }))
    } finally {
      setGenerating((prev) => ({ ...prev, [i]: false }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      description: form.description || null,
      cover_image: form.cover_image || null,
    }

    try {
      const res = await fetch(
        isEditing ? `/api/admin/learn/${collection!.id}` : "/api/admin/learn",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || "Failed to save collection.")
      }

      router.push("/admin/learn")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save collection.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Collection</CardTitle>
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
                placeholder="greetings"
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

          <ImageUploadField
            label="Cover image"
            folder="azen/learn"
            value={form.cover_image}
            onChange={(url) => update("cover_image", url)}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
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
          <CardTitle>Phrases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.phrases.map((phrase, i) => (
            <Card key={i} className="bg-secondary/5">
              <CardContent className="space-y-2 pt-6">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    placeholder="Japanese"
                    value={phrase.japanese}
                    onChange={(e) => updatePhrase(i, { japanese: e.target.value })}
                  />
                  <Input
                    placeholder="Romaji"
                    value={phrase.romaji}
                    onChange={(e) => updatePhrase(i, { romaji: e.target.value })}
                  />
                  <Input
                    placeholder="English / Mongolian"
                    value={phrase.english}
                    onChange={(e) => updatePhrase(i, { english: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Context (optional)"
                  value={phrase.context ?? ""}
                  onChange={(e) => updatePhrase(i, { context: e.target.value })}
                />

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={generating[i] || !phrase.japanese.trim()}
                    onClick={() => generateAudio(i)}
                  >
                    {generating[i]
                      ? "Generating…"
                      : phrase.audio_url
                        ? "Regenerate audio"
                        : "Generate audio"}
                  </Button>
                  {phrase.audio_url && (
                    <audio controls src={phrase.audio_url} className="h-8" />
                  )}
                </div>
                {audioErrors[i] && <p className="text-xs text-destructive">{audioErrors[i]}</p>}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => update("phrases", form.phrases.filter((_, idx) => idx !== i))}
                >
                  Remove phrase
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update("phrases", [
                ...form.phrases,
                { id: crypto.randomUUID(), japanese: "", romaji: "", english: "", context: "" },
              ])
            }
          >
            + Add phrase
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create collection"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/learn")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
