"use client"

import * as React from "react"
import { Check, Share2 } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Native share sheet where the browser offers one, clipboard copy everywhere
 * else. `navigator.share` is only exposed on secure origins, so the clipboard
 * fallback is the path most desktop readers take.
 */
export function ArticleShareButton({
  title,
  className,
}: {
  title: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // dismissed, or share unavailable — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // clipboard blocked (permissions/insecure origin) — nothing useful to do
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "Холбоос хуулагдлаа" : "Хуваалцах"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform hover:scale-110 active:scale-95",
        className
      )}
    >
      {copied ? (
        <Check className="size-4.5 text-success" />
      ) : (
        <Share2 className="size-4.5 text-foreground/70" />
      )}
    </button>
  )
}
