import { PillBadge } from "@/components/ui/pill-badge"
import { initials } from "@/lib/utils"

interface LiveBlogCardPreviewProps {
  title: string
  categoryLabel?: string
  coverImage: string | null
  guideName: string
  guideImage?: string | null
  readMinutes: number
}

/**
 * Live mirror of `PostCard`'s look (design doc Screen 11's blog composer),
 * driven by the post form's in-memory state — no `posts` row exists yet, so
 * this skips the real `Link`/`SaveHeart` (both need a persisted slug/id).
 */
export function LiveBlogCardPreview({
  title,
  categoryLabel,
  coverImage,
  guideName,
  guideImage,
  readMinutes,
}: LiveBlogCardPreviewProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_20px_40px_-20px_rgba(15,59,107,0.28)]">
      <div
        className="h-[150px] bg-muted bg-cover bg-center"
        style={{
          backgroundImage: coverImage ? `url(${coverImage})` : "linear-gradient(160deg, #0F3B6B, #2D7DD2)",
        }}
      />
      <div className="p-4 pb-[18px]">
        {categoryLabel && <PillBadge variant="sky">{categoryLabel}</PillBadge>}
        <h3 className="mt-2.5 font-display text-[17px] font-bold leading-[1.25] text-foreground">
          {title || <span className="text-muted-foreground">Нийтлэлийн гарчиг</span>}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {guideImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={guideImage} alt={guideName} className="size-[22px] shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-[10px] font-bold text-white">
              {initials(guideName || "?")}
            </span>
          )}
          {guideName} · {readMinutes} мин унших
        </div>
      </div>
    </div>
  )
}
