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
import type { GuideRow } from "@/lib/supabase/types"

type UserOption = { id: string; email: string | null; full_name: string | null; role: string }

type FormState = {
  name: string
  location: string
  tags: string
  rating: number
  review_count: number
  price: string
  bio: string
  is_verified: boolean
  is_active: boolean
  image: string
  image_public_id: string
  video_url: string
  profile_id: string
}

function toFormState(guide?: GuideRow | null): FormState {
  return {
    name: guide?.name ?? "",
    location: guide?.location ?? "",
    tags: guide?.tags?.join(", ") ?? "",
    rating: guide?.rating ?? 5,
    review_count: guide?.review_count ?? 0,
    price: guide?.price != null ? String(guide.price) : "",
    bio: guide?.bio ?? "",
    is_verified: guide?.is_verified ?? false,
    is_active: guide?.is_active ?? true,
    image: guide?.image ?? "",
    image_public_id: guide?.image_public_id ?? "",
    video_url: guide?.video_url ?? "",
    profile_id: guide?.profile_id ?? "",
  }
}

interface GuideFormProps {
  guide?: GuideRow | null
}

export function GuideForm({ guide }: GuideFormProps) {
  const router = useRouter()
  const isEditing = !!guide
  const [form, setForm] = React.useState<FormState>(() => toFormState(guide))
  const [users, setUsers] = React.useState<UserOption[]>([])
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setUsers(json.data ?? []))
      .catch(() => setUsers([]))
  }, [])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      location: form.location || null,
      bio: form.bio || null,
      image: form.image || null,
      image_public_id: form.image_public_id || null,
      video_url: form.video_url || null,
      price: form.price ? Number(form.price) : null,
      profile_id: form.profile_id || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }

    try {
      const res = await fetch(
        isEditing ? `/api/admin/guides/${guide!.id}` : "/api/admin/guides",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || "Failed to save guide.")
      }

      router.push("/admin/guides")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save guide.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Tokyo, Japan"
              />
            </div>
          </div>

          <ImageUploadField
            label="Photo"
            folder="azen/guides"
            value={form.image}
            onChange={(url, publicId) => {
              update("image", url)
              update("image_public_id", publicId)
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Intro video URL</Label>
            <Input
              id="video_url"
              value={form.video_url}
              onChange={(e) => update("video_url", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="Food tours, Nightlife, History"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => update("rating", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review_count">Review count</Label>
              <Input
                id="review_count"
                type="number"
                value={form.review_count}
                onChange={(e) => update("review_count", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (per day, ¥)</Label>
              <Input
                id="price"
                type="number"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_verified"
                checked={form.is_verified}
                onCheckedChange={(checked) => update("is_verified", checked === true)}
              />
              <Label htmlFor="is_verified">Verified</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => update("is_active", checked === true)}
              />
              <Label htmlFor="is_active">Active (visible on /guides)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Optional. Linking a registered user here promotes their account role to{" "}
            <code>guide</code> automatically, so they can manage this listing once that's
            supported. Leave unlinked for a directory-only listing.
          </p>
          <div className="space-y-2">
            <Label htmlFor="profile_id">Linked user</Label>
            <select
              id="profile_id"
              value={form.profile_id}
              onChange={(e) => update("profile_id", e.target.value)}
              className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none"
            >
              <option value="">— None —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email ?? u.full_name ?? u.id} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create guide"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/guides")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
