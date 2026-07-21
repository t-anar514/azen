"use client"

import { CheckCircle2, PlayCircle, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PillBadge } from "@/components/ui/pill-badge"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useMounted } from "@/hooks/useMounted"
import { BookingModal } from "./BookingModal"
import { MessageModal } from "./MessageModal"
import type { GuideRow } from "@/lib/supabase/types"

const TAG_TINTS = ["sky", "saffron", "sage", "lilac"] as const

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

/** Compact directory card (design doc, Screen 04) — booking + message preserved. */
export function GuideDirectoryCard({ guide }: { guide: GuideRow }) {
  // Radix dialogs generate their own ids via useId; keeping them out of the
  // hydration pass avoids a server/client aria-controls mismatch. Static button
  // markup is identical, so there's no visual flash.
  const mounted = useMounted()
  const isYouTube =
    guide.video_url?.includes("youtube.com") || guide.video_url?.includes("youtu.be")

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        {/* avatar / video */}
        <div className="relative size-14 shrink-0">
          {guide.image ? (
            <img
              src={guide.image}
              alt={guide.name}
              className="size-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full bg-tint-sky text-sm font-bold text-primary">
              {initials(guide.name)}
            </div>
          )}
          {guide.video_url &&
            (mounted ? (
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    aria-label="Танилцуулга видео"
                    className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-white shadow"
                  >
                    <PlayCircle className="size-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] overflow-hidden border-none bg-black p-0 text-white">
                  <div className="flex aspect-video w-full items-center justify-center bg-black">
                    {isYouTube ? (
                      <iframe
                        title={`${guide.name} intro`}
                        src={guide.video_url!.replace("watch?v=", "embed/")}
                        className="h-full w-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={guide.video_url!} controls autoPlay className="h-full w-full object-contain" />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-white shadow">
                <PlayCircle className="size-4" />
              </span>
            ))}
        </div>

        {/* name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-lg font-bold text-foreground">{guide.name}</h3>
            {guide.is_verified && <CheckCircle2 className="size-4 shrink-0 text-success" />}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="size-3.5 fill-saffron-600 text-saffron-600" />
            <span className="font-semibold text-foreground">{guide.rating}</span>
            <span>({guide.review_count})</span>
            {guide.location && <span>· {guide.location}</span>}
          </div>
        </div>

        {/* price */}
        <div className="shrink-0 text-right">
          <div className="font-display text-lg font-bold text-foreground">
            ¥{(guide.price ?? 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">/цаг</div>
        </div>
      </div>

      {guide.bio && (
        <p className="line-clamp-2 text-sm italic text-muted-foreground">
          &laquo;{guide.bio}&raquo;
        </p>
      )}

      {guide.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {guide.tags.slice(0, 4).map((tag, i) => (
            <PillBadge key={tag} variant={TAG_TINTS[i % TAG_TINTS.length]}>
              {tag}
            </PillBadge>
          ))}
        </div>
      )}

      <div className="mt-auto flex gap-3 pt-1">
        {mounted ? (
          <>
            <BookingModal
              guideId={guide.id}
              guideName={guide.name}
              trigger={
                <Button variant="reserve" className="flex-1 rounded-pill">
                  Захиалах
                </Button>
              }
            />
            <MessageModal
              guideId={guide.id}
              guideName={guide.name}
              trigger={
                <Button variant="outline" className="flex-1 rounded-pill">
                  Зурвас илгээх
                </Button>
              }
            />
          </>
        ) : (
          <>
            <Button variant="reserve" className="flex-1 rounded-pill">
              Захиалах
            </Button>
            <Button variant="outline" className="flex-1 rounded-pill">
              Зурвас илгээх
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
