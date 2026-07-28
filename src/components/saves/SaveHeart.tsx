"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Bookmark, Heart } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { track } from "@/lib/analytics"
import { SaveToFolderSheet } from "@/components/saves/SaveToFolderSheet"
import { cn } from "@/lib/utils"
import type { SaveableType } from "@/lib/supabase/types"

interface SaveHeartProps {
  itemType: SaveableType
  itemId: string
  /** Open the folder picker after saving (detail pages); cards keep quick-save */
  withSheet?: boolean
  /** Articles bookmark rather than "like" — same save, different affordance. */
  icon?: "heart" | "bookmark"
  className?: string
}

// Optimistic save toggle. Logged out → /login with a return path.
// A save starts unfiled (folder_id null); the sheet files it into a folder.
export function SaveHeart({
  itemType,
  itemId,
  withSheet = false,
  icon = "heart",
  className,
}: SaveHeartProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [saved, setSaved] = React.useState<boolean | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const busy = React.useRef(false)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (!cancelled) setSaved(false)
        return
      }
      const { data } = await supabase
        .from("saved_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .limit(1)
      if (!cancelled) setSaved((data ?? []).length > 0)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [itemType, itemId])

  async function toggle(e: React.MouseEvent) {
    // hearts live inside <Link> cards — never navigate
    e.preventDefault()
    e.stopPropagation()
    if (busy.current || saved === null) return
    busy.current = true

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      busy.current = false
      // keep the tab/filter query so they land back where they were
      const query = searchParams.toString()
      const returnTo = query ? `${pathname}?${query}` : pathname
      router.push(`/login?redirectTo=${encodeURIComponent(returnTo)}`)
      return
    }

    const wasSaved = saved
    setSaved(!wasSaved)

    if (wasSaved) {
      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
      if (error) setSaved(true)
    } else {
      const { error } = await supabase
        .from("saved_items")
        .insert({ user_id: user.id, item_type: itemType, item_id: itemId })
      if (error) {
        setSaved(false)
      } else {
        track("place_saved", { item_type: itemType, item_id: itemId })
        if (withSheet) setSheetOpen(true)
      }
    }
    busy.current = false
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={saved ? "Хадгалснаас хасах" : "Хадгалах"}
        aria-pressed={saved === true}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95",
          className
        )}
      >
        {icon === "bookmark" ? (
          <Bookmark
            className={cn(
              "size-4.5 transition-colors",
              saved ? "fill-primary text-primary" : "text-foreground/70"
            )}
          />
        ) : (
          <Heart
            className={cn(
              "size-4.5 transition-colors",
              saved ? "fill-destructive text-destructive" : "text-foreground/70"
            )}
          />
        )}
      </button>
      {withSheet && (
        <SaveToFolderSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          itemType={itemType}
          itemId={itemId}
        />
      )}
    </>
  )
}
