"use client"

import * as React from "react"
import { Compass, Eye, Gem, Leaf, Plus, UtensilsCrossed, Wine, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TagChipsInput } from "@/components/studio/TagChipsInput"
import { LivePlaceCardPreview } from "@/components/studio/LivePlaceCardPreview"
import { CATEGORY_LABEL } from "@/components/places/categoryLabels"
import { uploadToCloudinary } from "@/lib/cloudinary/clientUpload"
import { cn } from "@/lib/utils"
import type { PlaceCategory } from "@/lib/supabase/types"

const CATEGORY_CHIPS: { label: string; value: PlaceCategory; icon: LucideIcon }[] = [
  { label: "Юу үзэх", value: "things_to_do", icon: Compass },
  { label: "Хаана хооллох", value: "places_to_eat", icon: UtensilsCrossed },
  { label: "Шөнийн амьдрал", value: "nightlife", icon: Wine },
  // The `places` category enum has no distinct "nature" value — this chip
  // intentionally writes the same `things_to_do` value as "Юу үзэх" (spec'd
  // in the studio brief). Editing an existing things_to_do place always
  // re-selects the first matching chip ("Юу үзэх"), which is an accepted,
  // documented lossy round-trip.
  { label: "Байгаль", value: "things_to_do", icon: Leaf },
]

export interface RecommendationInitial {
  id: string
  name: string
  cityId: string
  neighborhood: string | null
  category: PlaceCategory
  priceBand: number | null
  coverImage: string | null
  gallery: string[]
  quote: string
  isHiddenGem: boolean
  tags: string[]
}

interface CreateRecommendationFormProps {
  /** Matches the `form` attribute on the header's external submit buttons (Task 4.6). */
  formId: string
  cities: { id: string; name: string; slug: string }[]
  guideName: string
  guideImage?: string | null
  initial?: RecommendationInitial | null
  onSubmittingChange?: (submitting: boolean) => void
  onSaved?: (result: { id: string; published: boolean }) => void
  onError?: (message: string | null) => void
}

function chipIndexForCategory(category?: PlaceCategory) {
  if (!category) return 0
  const idx = CATEGORY_CHIPS.findIndex((c) => c.value === category)
  return idx === -1 ? 0 : idx
}

/**
 * Зөвлөмж (recommendation) create/edit form + its live PlaceCard preview,
 * as one two-pane unit (design doc Screen 11). The header's Ноорог/Нийтлэх
 * buttons live one level up (StudioNewScreen, Task 4.6) and target this
 * form via the HTML `form` attribute — `handleSubmit` reads
 * `submitEvent.submitter` to tell which one was clicked.
 */
export function CreateRecommendationForm({
  formId,
  cities,
  guideName,
  guideImage,
  initial,
  onSubmittingChange,
  onSaved,
  onError,
}: CreateRecommendationFormProps) {
  const isEditing = !!initial
  const [editingId, setEditingId] = React.useState<string | null>(initial?.id ?? null)
  const [chipIndex, setChipIndex] = React.useState(() => chipIndexForCategory(initial?.category))
  const [name, setName] = React.useState(initial?.name ?? "")
  const [cityId, setCityId] = React.useState(initial?.cityId ?? cities[0]?.id ?? "")
  const [neighborhood, setNeighborhood] = React.useState(initial?.neighborhood ?? "")
  const [priceBand, setPriceBand] = React.useState(initial?.priceBand ?? 2)
  const [images, setImages] = React.useState<(string | null)[]>(() => {
    const arr = [initial?.coverImage ?? null, ...(initial?.gallery ?? [])]
    while (arr.length < 4) arr.push(null)
    return arr.slice(0, 4)
  })
  const [quote, setQuote] = React.useState(initial?.quote ?? "")
  const [isHiddenGem, setIsHiddenGem] = React.useState(initial?.isHiddenGem ?? false)
  const [tags, setTags] = React.useState<string[]>(initial?.tags ?? [])
  const [uploadingIndex, setUploadingIndex] = React.useState<number | null>(null)
  const [imageError, setImageError] = React.useState<string | null>(null)
  const [fieldError, setFieldError] = React.useState<string | null>(null)
  const fileInputs = React.useRef<(HTMLInputElement | null)[]>([])

  const chip = CATEGORY_CHIPS[chipIndex]
  const cityName = cities.find((c) => c.id === cityId)?.name ?? ""
  const firstEmptySlot = images.findIndex((u) => !u)

  async function handleSlotFile(index: number, file: File) {
    setImageError(null)
    setUploadingIndex(index)
    try {
      const url = await uploadToCloudinary(file, "azen/guides/recommendations")
      setImages((prev) => {
        const next = [...prev]
        next[index] = url
        return next
      })
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Зураг оруулахад алдаа гарлаа.")
    } finally {
      setUploadingIndex(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const publishing = submitter?.value === "publish"

    if (!name.trim() || !cityId || !quote.trim()) {
      setFieldError("Газрын нэр, хот, тайлбарыг бөглөнө үү.")
      return
    }
    setFieldError(null)
    onError?.(null)
    onSubmittingChange?.(true)

    const gallery = images.slice(1).filter((u): u is string => !!u)

    try {
      if (editingId) {
        const res = await fetch("/api/studio/recommendations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            name,
            neighborhood: neighborhood || null,
            priceBand,
            coverImage: images[0],
            gallery,
            tags,
            isHiddenGem,
            quote,
            published: publishing,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error ?? `Алдаа гарлаа (${res.status})`)
        }
        onSaved?.({ id: editingId, published: publishing })
      } else {
        const res = await fetch("/api/studio/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            cityId,
            neighborhood: neighborhood || null,
            category: chip.value,
            priceBand,
            coverImage: images[0],
            gallery,
            quote,
            isHiddenGem,
            tags,
            published: publishing,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error ?? `Алдаа гарлаа (${res.status})`)
        }
        const data: { id: string } = await res.json()
        setEditingId(data.id)
        onSaved?.({ id: data.id, published: publishing })
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа.")
    } finally {
      onSubmittingChange?.(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
      {/* ─────────── FORM ─────────── */}
      <div className="flex flex-col gap-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {isEditing ? "Зөвлөмж засах" : "Шинэ зөвлөмж"}
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight md:text-[26px]">
            Дуртай газраа санал болго
          </h1>
        </div>

        {(fieldError || imageError) && (
          <p className="rounded-well bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
            {fieldError ?? imageError}
          </p>
        )}

        {/* type */}
        <div>
          <div className="mb-2.5 text-[12.5px] font-bold text-foreground/80">Төрөл</div>
          <div className="flex flex-wrap gap-2.5">
            {CATEGORY_CHIPS.map((c, i) => {
              const active = i === chipIndex
              return (
                <button
                  key={c.label}
                  type="button"
                  disabled={isEditing}
                  onClick={() => setChipIndex(i)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-thumb border px-4 py-2.5 text-[13.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    active
                      ? "border-2 border-primary bg-secondary text-primary"
                      : "border-border bg-card text-foreground/70 hover:border-primary/40"
                  )}
                >
                  <c.icon className="size-4" strokeWidth={1.9} />
                  {c.label}
                </button>
              )
            })}
          </div>
          {isEditing && (
            <p className="mt-2 text-xs text-muted-foreground">Үүсгэсний дараа төрлийг өөрчлөх боломжгүй.</p>
          )}
        </div>

        {/* name */}
        <div>
          <Label htmlFor="rec-name" className="mb-2 text-[12.5px] font-bold text-foreground/80">
            Газрын нэр
          </Label>
          <Input
            id="rec-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="teamLab Planets"
            className="h-auto rounded-well border-border px-4 py-3.5 text-[14.5px] font-semibold"
          />
        </div>

        {/* city + district */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rec-city" className="mb-2 text-[12.5px] font-bold text-foreground/80">
              Хот
            </Label>
            <select
              id="rec-city"
              value={cityId}
              disabled={isEditing}
              onChange={(e) => setCityId(e.target.value)}
              className="h-auto w-full rounded-well border border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="rec-neighborhood" className="mb-2 text-[12.5px] font-bold text-foreground/80">
              Дүүрэг
            </Label>
            <Input
              id="rec-neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Тойосу"
              className="h-auto rounded-well border-border px-4 py-3.5 text-sm font-semibold"
            />
          </div>
        </div>
        {isEditing && (
          <p className="-mt-4 text-xs text-muted-foreground">Хотыг үүсгэсний дараа өөрчлөх боломжгүй.</p>
        )}

        {/* price */}
        <div>
          <div className="mb-2 text-[12.5px] font-bold text-foreground/80">Үнийн түвшин</div>
          <div className="inline-flex rounded-well bg-muted p-1">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPriceBand(n)}
                className={cn(
                  "rounded-[9px] px-5 py-2.5 text-sm font-semibold transition-colors",
                  priceBand === n ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                )}
              >
                {"¥".repeat(n)}
              </button>
            ))}
          </div>
        </div>

        {/* photos */}
        <div>
          <div className="mb-2 text-[12.5px] font-bold text-foreground/80">Зураг</div>
          <div className="grid grid-cols-4 gap-3">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => fileInputs.current[i]?.click()}
                disabled={uploadingIndex !== null}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-[14px] disabled:cursor-wait",
                  url
                    ? "bg-cover bg-center"
                    : i === firstEmptySlot
                      ? "border-[1.5px] border-dashed border-border bg-card"
                      : "border-[1.5px] border-dashed border-border/60 bg-card"
                )}
                style={url ? { backgroundImage: `url(${url})` } : undefined}
              >
                <input
                  ref={(el) => {
                    fileInputs.current[i] = el
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleSlotFile(i, file)
                    e.target.value = ""
                  }}
                />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-pill bg-black/40 px-2 py-0.5 text-[9.5px] font-bold text-white">
                    Нүүр
                  </span>
                )}
                {uploadingIndex === i ? (
                  <span className="flex h-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
                    …
                  </span>
                ) : !url ? (
                  <span className="flex h-full items-center justify-center text-muted-foreground">
                    <Plus className="size-[22px]" strokeWidth={2} />
                  </span>
                ) : (
                  <span
                    role="presentation"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImages((prev) => {
                        const next = [...prev]
                        next[i] = null
                        return next
                      })
                    }}
                    className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/50 text-white"
                  >
                    <X className="size-3" strokeWidth={2.5} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* why */}
        <div>
          <Label htmlFor="rec-quote" className="mb-2 block text-[12.5px] font-bold text-foreground/80">
            Яагаад санал болгож байна?{" "}
            <span className="font-medium text-muted-foreground">— энэ таны PlaceCard дээр гарна</span>
          </Label>
          <Textarea
            id="rec-quote"
            value={quote}
            maxLength={240}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Ус, гэрлийн дижитал урлагийн умбуулах ертөнц…"
            rows={4}
            className="rounded-well border-border px-4 py-3.5 text-sm leading-relaxed"
          />
          <div className="mt-1 flex justify-end text-[11.5px] text-muted-foreground">{quote.length} / 240</div>
        </div>

        {/* hidden gem toggle */}
        <div className="flex items-center justify-between rounded-[14px] border border-[#F1DEBE] bg-saffron-50 px-[18px] py-3.5">
          <div className="flex items-center gap-2.5">
            <Gem className="size-5 text-saffron-600" strokeWidth={1.9} />
            <div>
              <div className="text-sm font-bold text-foreground">Нуугдмал эрдэнэ гэж тэмдэглэх</div>
              <div className="text-xs text-saffron-600">Жуулчид ховор мэддэг онцгой газар</div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isHiddenGem}
            onClick={() => setIsHiddenGem((v) => !v)}
            className={cn(
              "relative h-[26px] w-[46px] shrink-0 rounded-pill transition-colors",
              isHiddenGem ? "bg-saffron" : "bg-border"
            )}
          >
            <span
              className={cn(
                "absolute top-[3px] size-5 rounded-full bg-white transition-transform",
                isHiddenGem ? "translate-x-[23px]" : "translate-x-[3px]"
              )}
            />
          </button>
        </div>

        {/* tags */}
        <div>
          <div className="mb-2 text-[12.5px] font-bold text-foreground/80">Шошго</div>
          <TagChipsInput value={tags} onChange={setTags} addLabel="+ Шошго нэмэх" />
        </div>
      </div>

      {/* ─────────── LIVE PREVIEW ─────────── */}
      <div className="flex flex-col gap-3.5 lg:sticky lg:top-5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
          <Eye className="size-3.5" strokeWidth={2} /> Урьдчилан харах
        </div>
        <LivePlaceCardPreview
          name={name}
          category={chip.value}
          categoryLabel={CATEGORY_LABEL[chip.value] ?? chip.label}
          cityName={cityName}
          neighborhood={neighborhood}
          priceBand={priceBand}
          coverImage={images[0]}
          quote={quote}
          isHiddenGem={isHiddenGem}
          guideName={guideName}
          guideImage={guideImage}
        />
        <div className="rounded-[14px] border border-sky-200 bg-secondary px-4 py-3.5 text-[12.5px] leading-relaxed text-primary">
          <b>
            {cityName || "Хот"} · {chip.label}
          </b>{" "}
          хуудсанд болон таны профайлд шууд гарна.
        </div>
      </div>
    </form>
  )
}
