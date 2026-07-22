import { Gem, Heart, MapPin } from "lucide-react"

import { PillBadge } from "@/components/ui/pill-badge"
import { CATEGORY_TINT } from "@/components/places/PlaceCard"
import { cn, initials } from "@/lib/utils"
import type { PlaceCategory } from "@/lib/supabase/types"

interface LivePlaceCardPreviewProps {
  name: string
  category: PlaceCategory
  categoryLabel: string
  cityName: string
  priceBand: number
  coverImage: string | null
  quote: string
  isHiddenGem: boolean
  guideName: string
  guideImage?: string | null
}

/**
 * Live mirror of `PlaceCard`'s look (design doc Screen 11's preview pane),
 * driven entirely by the create form's in-memory state — there is no real
 * `places` row yet, so this intentionally skips `Link`/`SaveHeart` (both
 * need a persisted id) and renders lightweight look-alikes instead.
 */
export function LivePlaceCardPreview({
  name,
  category,
  categoryLabel,
  cityName,
  priceBand,
  coverImage,
  quote,
  isHiddenGem,
  guideName,
  guideImage,
}: LivePlaceCardPreviewProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_20px_40px_-20px_rgba(15,59,107,0.28)]">
      <div
        className="relative h-[190px] bg-muted bg-cover bg-center"
        style={{
          backgroundImage: coverImage
            ? `url(${coverImage})`
            : "linear-gradient(160deg, #3B1D5F, #2D7DD2 70%, #0F3B6B)",
        }}
      >
        <div className="absolute left-3 top-3">
          <PillBadge variant={CATEGORY_TINT[category]}>{categoryLabel}</PillBadge>
        </div>
        <span className="pointer-events-none absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/90">
          <Heart className="size-[15px] text-muted-foreground" strokeWidth={2} />
        </span>
        {isHiddenGem && (
          <div className="absolute right-3 top-[52px]">
            <PillBadge variant="saffron">
              <Gem /> Нуугдмал эрдэнэ
            </PillBadge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4 pb-[18px]">
        <h3 className="font-display text-[16.5px] font-bold leading-snug text-foreground">
          {name || <span className="text-muted-foreground">Газрын нэр</span>}
        </h3>
        <p className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-[13px]" /> {cityName || "Хот"}
          </span>
          <span aria-hidden>·</span>
          <span className="font-bold text-foreground/80">{"¥".repeat(Math.min(3, Math.max(1, priceBand)))}</span>
        </p>
        <p className={cn("text-[13px] leading-relaxed text-muted-foreground line-clamp-2", !quote && "italic")}>
          {quote || "Таны тайлбар эндээс харагдана…"}
        </p>
        <div className="mt-1 flex items-center gap-2 border-t border-border pt-2.5">
          {guideImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={guideImage} alt={guideName} className="size-6 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-[10px] font-bold text-white">
              {initials(guideName || "?")}
            </span>
          )}
          <span className="text-[11.5px] italic text-muted-foreground">{guideName} санал болгосон</span>
        </div>
      </div>
    </div>
  )
}
