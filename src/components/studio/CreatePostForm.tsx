"use client"

import * as React from "react"
import { Bold, ImagePlus, Italic, Link as LinkIcon, List, Type as TypeIcon, Underline } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LiveBlogCardPreview } from "@/components/studio/LiveBlogCardPreview"
import { uploadToCloudinary } from "@/lib/cloudinary/clientUpload"
import { readMinutes } from "@/lib/blog/readMinutes"
import { cn } from "@/lib/utils"

// Mirrors the existing blog taxonomy (t("Hacks.categories.*") in
// src/messages/mn.json, consumed by /blog's category filter) so a
// guide-authored post files under the same categories as admin content.
const POST_CATEGORIES = [
  { value: "Transport", label: "Тээвэр" },
  { value: "Food", label: "Хоол" },
  { value: "Money", label: "Мөнгө" },
  { value: "Logistics", label: "Ложистик" },
  { value: "Etiquette", label: "Ёс зүй" },
  { value: "Tourist Trap", label: "Жуулчны занга" },
] as const

interface CreatePostFormProps {
  /** Matches the `form` attribute on the header's external submit buttons (Task 4.6). */
  formId: string
  guideName: string
  guideImage?: string | null
  onSubmittingChange?: (submitting: boolean) => void
  onSaved?: (result: { id: string; published: boolean }) => void
  onError?: (message: string | null) => void
}

/**
 * Blog post create form + its live BlogCard preview, as one two-pane unit
 * (design doc Screen 11's "Эсвэл — блог нийтлэл бич" section). No edit path
 * is spec'd for posts (unlike recommendations) — `savedId` only guards
 * against a duplicate POST if the guide saves-as-draft then publishes in the
 * same sitting.
 */
export function CreatePostForm({ formId, guideName, guideImage, onSubmittingChange, onSaved, onError }: CreatePostFormProps) {
  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState<string>(POST_CATEGORIES[0].value)
  const [coverImage, setCoverImage] = React.useState<string | null>(null)
  const [body, setBody] = React.useState("")
  const [uploading, setUploading] = React.useState(false)
  const [imageError, setImageError] = React.useState<string | null>(null)
  const [fieldError, setFieldError] = React.useState<string | null>(null)
  const [savedId, setSavedId] = React.useState<string | null>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function handleCoverFile(file: File) {
    setImageError(null)
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, "azen/guides/posts")
      setCoverImage(url)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Зураг оруулахад алдаа гарлаа.")
    } finally {
      setUploading(false)
    }
  }

  function wrapSelection(before: string, after: string = before) {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = body.slice(start, end)
    const next = body.slice(0, start) + before + selected + after + body.slice(end)
    setBody(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }

  function prefixLine(prefix: string) {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const lineStart = body.lastIndexOf("\n", start - 1) + 1
    const next = body.slice(0, lineStart) + prefix + body.slice(lineStart)
    setBody(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, end + prefix.length)
    })
  }

  function insertLink() {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = body.slice(start, end) || "холбоос"
    const insertion = `[${selected}](https://)`
    const next = body.slice(0, start) + insertion + body.slice(end)
    setBody(next)
    requestAnimationFrame(() => {
      el.focus()
      const urlStart = start + selected.length + 3
      el.setSelectionRange(urlStart, urlStart + "https://".length)
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const publishing = submitter?.value === "publish"

    if (!title.trim() || !body.trim()) {
      setFieldError("Гарчиг болон нийтлэлийн бичвэрийг бөглөнө үү.")
      return
    }
    setFieldError(null)
    onError?.(null)
    onSubmittingChange?.(true)

    const payload = { title, category, coverImage, body, published: publishing }
    try {
      const res = await fetch("/api/studio/posts", {
        method: savedId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savedId ? { id: savedId, ...payload } : payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? `Алдаа гарлаа (${res.status})`)
      }
      const data: { id: string } = await res.json()
      const id = savedId ?? data.id
      setSavedId(id)
      onSaved?.({ id, published: publishing })
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа.")
    } finally {
      onSubmittingChange?.(false)
    }
  }

  const categoryLabel = POST_CATEGORIES.find((c) => c.value === category)?.label

  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
      <div className="flex flex-col gap-5">
        {(fieldError || imageError) && (
          <p className="rounded-well bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
            {fieldError ?? imageError}
          </p>
        )}

        <div>
          <Label htmlFor="post-title" className="mb-2 text-[12.5px] font-bold text-foreground/80">
            Гарчиг
          </Label>
          <Input
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Токиогийн галт тэргээр яаж зорчих вэ"
            className="h-auto rounded-well border-border px-4 py-3.5 font-display text-[19px] font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="post-category" className="mb-2 text-[12.5px] font-bold text-foreground/80">
              Ангилал
            </Label>
            <select
              id="post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-auto w-full rounded-well border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {POST_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-2 text-[12.5px] font-bold text-foreground/80">Нүүр зураг</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={cn(
                "flex h-[46px] w-full items-center gap-2 overflow-hidden rounded-well border-[1.5px] border-dashed border-border bg-card px-4 text-[13px] font-medium text-muted-foreground disabled:cursor-wait",
                coverImage && "border-solid bg-cover bg-center text-white"
              )}
              style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
            >
              <ImagePlus className={cn("size-4 shrink-0", coverImage && "drop-shadow")} />
              <span className={cn(coverImage && "drop-shadow")}>
                {uploading ? "Байршуулж байна…" : coverImage ? "Зураг солих" : "Зураг чирж оруулах"}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleCoverFile(file)
                e.target.value = ""
              }}
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block text-[12.5px] font-bold text-foreground/80">Бичвэр</Label>
          <div className="flex items-center gap-1 rounded-t-well border border-b-0 border-border bg-muted/40 px-3 py-2">
            <ToolbarButton label="Тод" onClick={() => wrapSelection("**")}>
              <Bold className="size-[15px]" strokeWidth={2.5} />
            </ToolbarButton>
            <ToolbarButton label="Налуу" onClick={() => wrapSelection("*")}>
              <Italic className="size-[15px]" />
            </ToolbarButton>
            <ToolbarButton label="Доогуур зураас" onClick={() => wrapSelection("<u>", "</u>")}>
              <Underline className="size-[15px]" />
            </ToolbarButton>
            <span className="mx-1 h-[18px] w-px bg-border" />
            <ToolbarButton label="Гарчиг" onClick={() => prefixLine("## ")}>
              <TypeIcon className="size-4" />
            </ToolbarButton>
            <ToolbarButton label="Жагсаалт" onClick={() => prefixLine("- ")}>
              <List className="size-4" />
            </ToolbarButton>
            <ToolbarButton label="Холбоос" onClick={insertLink}>
              <LinkIcon className="size-4" />
            </ToolbarButton>
          </div>
          <Textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={9}
            placeholder="Токиогийн галт тэрэгний сүлжээ анх харахад төвөгтэй санагдаж болох ч цөөн хэдэн зүйлийг мэдвэл бүх зүйл амар болно…"
            className="rounded-t-none rounded-b-well border-border px-4 py-4 text-sm leading-relaxed"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3.5 lg:sticky lg:top-5">
        <div className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Блог карт</div>
        <LiveBlogCardPreview
          title={title}
          categoryLabel={categoryLabel}
          coverImage={coverImage}
          guideName={guideName}
          guideImage={guideImage}
          readMinutes={readMinutes({ body_md: body })}
        />
      </div>
    </form>
  )
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
    >
      {children}
    </button>
  )
}
