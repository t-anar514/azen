"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ImageUploadField } from "@/components/admin/ImageUploadField"
import { TagChipsInput } from "@/components/studio/TagChipsInput"
import type { GuideRow } from "@/lib/supabase/types"

const FIELD =
  "w-full rounded-thumb border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
const LABEL = "mb-1.5 block text-sm font-semibold text-foreground"

/**
 * `/studio/profile` editor. Writes only the presentation columns the
 * `/api/studio/profile` whitelist accepts (bio/cover/avatar/tags/location/
 * price/video) — trust fields (rating, is_verified) are protected by both
 * that whitelist and the DB guard trigger, so they're not editable here.
 */
export function ProfileEditForm({ guide }: { guide: GuideRow }) {
  const router = useRouter()
  const [image, setImage] = React.useState(guide.image)
  const [imagePublicId, setImagePublicId] = React.useState(guide.image_public_id)
  const [coverImage, setCoverImage] = React.useState(guide.cover_image)
  const [bio, setBio] = React.useState(guide.bio ?? "")
  const [tags, setTags] = React.useState<string[]>(guide.tags ?? [])
  const [location, setLocation] = React.useState(guide.location ?? "")
  const [price, setPrice] = React.useState<string>(guide.price != null ? String(guide.price) : "")
  const [videoUrl, setVideoUrl] = React.useState(guide.video_url ?? "")

  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState<null | "ok" | string>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch("/api/studio/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          imagePublicId,
          coverImage,
          bio,
          tags,
          location,
          price: price === "" ? null : Number(price),
          videoUrl: videoUrl || null,
        }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setStatus("ok")
      router.refresh()
    } catch {
      setStatus("Хадгалахад алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-4">
          <ImageUploadField
            label="Профайл зураг"
            folder="guides/avatars"
            value={image}
            onChange={(url, publicId) => {
              setImage(url)
              setImagePublicId(publicId)
            }}
          />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <ImageUploadField
            label="Нүүр зураг (cover)"
            folder="guides/covers"
            value={coverImage}
            onChange={(url) => setCoverImage(url)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className={LABEL}>Танилцуулга</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className={FIELD}
          placeholder="Өөрийгөө танилцуулаарай — туршлага, хэл, мэргэшил…"
        />
      </div>

      <div>
        <span className={LABEL}>Шошго</span>
        <TagChipsInput value={tags} onChange={setTags} addLabel="+ Шошго нэмэх" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="location" className={LABEL}>Байршил</label>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={FIELD}
            placeholder="Киото, Япон"
          />
        </div>
        <div>
          <label htmlFor="price" className={LABEL}>Цагийн хөлс (¥)</label>
          <input
            id="price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={FIELD}
            placeholder="3500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="video" className={LABEL}>Танилцуулга видео (URL)</label>
        <input
          id="video"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className={FIELD}
          placeholder="https://…"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="reserve" disabled={saving} className="rounded-pill">
          {saving ? "Хадгалж байна…" : "Хадгалах"}
        </Button>
        {guide.slug && (
          <Button asChild variant="outline" className="rounded-pill">
            <Link href={`/guides/${guide.slug}`} target="_blank">
              <ExternalLink className="size-[15px]" /> Нийтийн профайл харах
            </Link>
          </Button>
        )}
        {status === "ok" && <span className="text-sm font-medium text-success">Хадгалагдлаа ✓</span>}
        {status && status !== "ok" && <span className="text-sm font-medium text-destructive">{status}</span>}
      </div>
    </form>
  )
}
