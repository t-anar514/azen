"use client"

import * as React from "react"
import { Folder, FolderPlus, Check } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { track } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { FolderRow, SaveableType } from "@/lib/supabase/types"

interface SaveToFolderSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemType: SaveableType
  itemId: string
}

// Files an existing save into a folder (a save lives in exactly one folder;
// picking another moves it). Folders can be created inline.
export function SaveToFolderSheet({ open, onOpenChange, itemType, itemId }: SaveToFolderSheetProps) {
  const [folders, setFolders] = React.useState<FolderRow[]>([])
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null)
  const [newName, setNewName] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    let cancelled = false
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: folderRows }, { data: saveRows }] = await Promise.all([
        supabase.from("folders").select("*").eq("user_id", user.id).order("created_at"),
        supabase
          .from("saved_items")
          .select("folder_id")
          .eq("user_id", user.id)
          .eq("item_type", itemType)
          .eq("item_id", itemId)
          .limit(1),
      ])
      if (cancelled) return
      setFolders(folderRows ?? [])
      setCurrentFolderId(saveRows?.[0]?.folder_id ?? null)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [open, itemType, itemId])

  async function fileInto(folderId: string | null) {
    setBusy(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setBusy(false)
      return
    }
    const { error } = await supabase
      .from("saved_items")
      .update({ folder_id: folderId })
      .eq("user_id", user.id)
      .eq("item_type", itemType)
      .eq("item_id", itemId)
    if (!error) {
      setCurrentFolderId(folderId)
      onOpenChange(false)
    }
    setBusy(false)
  }

  async function createFolder(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setBusy(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setBusy(false)
      return
    }
    const id = crypto.randomUUID()
    const { error } = await supabase
      .from("folders")
      .insert({ id, user_id: user.id, name })
    if (!error) {
      track("folder_created", {})
      setNewName("")
      setFolders((prev) => [...prev, {
        id, user_id: user.id, itinerary_id: null, name,
        cover_image: null, created_at: new Date().toISOString(),
      }])
      await fileInto(id)
    }
    setBusy(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto">
        <SheetHeader className="p-0 pb-4">
          <SheetTitle>Хавтаст хадгалах</SheetTitle>
        </SheetHeader>

        <div className="space-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInto(null)}
            className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-2">
              <Folder className="size-4 text-muted-foreground" /> Хавтасгүй
            </span>
            {currentFolderId === null && <Check className="size-4 text-primary" />}
          </button>

          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              disabled={busy}
              onClick={() => fileInto(folder.id)}
              className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <Folder className="size-4 text-primary" /> {folder.name}
              </span>
              {currentFolderId === folder.id && <Check className="size-4 text-primary" />}
            </button>
          ))}
        </div>

        <form onSubmit={createFolder} className="mt-4 flex gap-2 border-t border-border pt-4">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Шинэ хавтасны нэр… (ж: Токио — Өдөр 1)"
            className="rounded-full"
          />
          <Button type="submit" variant="outline" className="rounded-full shrink-0" disabled={busy || !newName.trim()}>
            <FolderPlus className="size-4" /> Үүсгэх
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
