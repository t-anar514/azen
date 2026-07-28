"use client"

import { Button } from "@/components/ui/button"
import { MessageModal } from "@/components/guides/MessageModal"
import { initials } from "@/lib/utils"
import { cn } from "@/lib/utils"

export interface ArticleAuthor {
  id: string
  name: string
  location: string | null
  image: string | null
  slug: string | null
  isVerified: boolean
}

function AuthorAvatar({ author, className }: { author: ArticleAuthor; className?: string }) {
  if (author.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={author.image}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-tint-sky text-[11px] font-bold text-sky-700",
        className
      )}
    >
      {initials(author.name)}
    </span>
  )
}

export { AuthorAvatar }

/**
 * End-of-article prompt to talk to the guide who wrote it — the design's answer
 * to an article ending in nothing. Desktop card variant.
 */
export function AskAuthorCard({ author }: { author: ArticleAuthor }) {
  const where = author.location ? `${author.name} ${author.location}-д хөтөч. ` : ""

  return (
    <div className="hidden items-center gap-4 rounded-thumb border border-border bg-card px-4 py-3.5 md:flex">
      <AuthorAvatar author={author} className="h-10 w-10 text-xs" />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-foreground">Асуулт байна уу?</p>
        <p className="truncate text-[12.5px] text-muted-foreground">
          {where}Шууд бичээд асуугаарай.
        </p>
      </div>
      <MessageModal
        guideId={author.id}
        guideName={author.name}
        trigger={
          <Button variant="message" size="sm" className="shrink-0 rounded-pill px-4">
            Зурвас илгээх
          </Button>
        }
      />
    </div>
  )
}

/** Phone variant — fixed above the safe area, replacing the traveler tab bar. */
export function AskAuthorBar({ author }: { author: ArticleAuthor }) {
  return (
    <>
      <div aria-hidden className="h-24 md:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <AuthorAvatar author={author} className="h-9 w-9 text-[10px]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-foreground">
              {author.name}-аас асуух
            </p>
            {author.location && (
              <p className="truncate text-[11.5px] text-muted-foreground">
                {author.location} хөтөч
              </p>
            )}
          </div>
          <MessageModal
            guideId={author.id}
            guideName={author.name}
            trigger={
              <Button variant="message" size="sm" className="shrink-0 rounded-pill px-5">
                Зурвас
              </Button>
            }
          />
        </div>
      </div>
    </>
  )
}
