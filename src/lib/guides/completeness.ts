import type { GuideRow } from "@/lib/supabase/types"

export function profileCompleteness(guide: GuideRow, publishedRecCount: number) {
  const items = [
    { key: "avatar", label: "Профайл зураг нэмсэн", done: !!guide.image },
    { key: "cover",  label: "Нүүр зураг нэмсэн",    done: !!guide.cover_image },
    { key: "bio",    label: "Танилцуулга бичсэн",    done: (guide.bio?.trim().length ?? 0) >= 40 },
    { key: "tags",   label: "3+ шошго нэмсэн",        done: (guide.tags?.length ?? 0) >= 3 },
    { key: "recs",   label: "10+ зөвлөмж нийтэлсэн",  done: publishedRecCount >= 10 },
    { key: "video",  label: "Танилцуулга видео нэмэх", done: !!guide.video_url },
  ]
  const done = items.filter(i => i.done).length
  return { pct: Math.round((done / items.length) * 100), items }
}
