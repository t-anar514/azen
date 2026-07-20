import { redirect } from "next/navigation"
import { Heart } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/page-header"
import { FolderGrid, type FolderSection } from "@/components/saves/FolderGrid"
import type { FolderRow, PlaceRow, PostRow, SavedItemRow } from "@/lib/supabase/types"

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?redirectTo=/account/saved")

  const [{ data: folders }, { data: savedItems }, { data: cities }] = await Promise.all([
    supabase.from("folders").select("*").eq("user_id", user.id).order("created_at"),
    supabase
      .from("saved_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("cities").select("id, slug"),
  ])

  const items = (savedItems ?? []) as SavedItemRow[]
  const placeIds = items.filter((i) => i.item_type === "place").map((i) => i.item_id)
  const postIds = items.filter((i) => i.item_type === "post").map((i) => i.item_id)

  const [{ data: places }, { data: posts }] = await Promise.all([
    placeIds.length
      ? supabase.from("places").select("*").in("id", placeIds)
      : Promise.resolve({ data: [] as PlaceRow[] }),
    postIds.length
      ? supabase.from("posts").select("*").in("id", postIds)
      : Promise.resolve({ data: [] as PostRow[] }),
  ])

  const placeById = new Map((places ?? []).map((p: PlaceRow) => [p.id, p]))
  const postById = new Map((posts ?? []).map((p: PostRow) => [p.id, p]))
  const citySlugById = Object.fromEntries(
    (cities ?? []).map((c: { id: string; slug: string | null }) => [c.id, c.slug ?? c.id])
  )

  function buildSection(id: string | null, name: string): FolderSection {
    const own = items.filter((i) => i.folder_id === id)
    return {
      id,
      name,
      places: own
        .filter((i) => i.item_type === "place")
        .map((i) => placeById.get(i.item_id))
        .filter(Boolean) as PlaceRow[],
      posts: own
        .filter((i) => i.item_type === "post")
        .map((i) => postById.get(i.item_id))
        .filter(Boolean) as PostRow[],
    }
  }

  const sections: FolderSection[] = [
    ...((folders ?? []) as FolderRow[]).map((f) => buildSection(f.id, f.name)),
    buildSection(null, "Хавтасгүй"),
  ]

  const total = items.length

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <PageHeader
          eyebrow="Миний цуглуулга"
          title="Хадгалсан газрууд"
          lead="Зүрхээр тэмдэглэсэн бүх зүйл — хавтаст цэгцэлж, аяллын төлөвлөгөөндөө нэмээрэй."
        />

        {total === 0 ? (
          <div className="rounded-card border border-dashed border-border p-16 text-center space-y-3">
            <Heart className="mx-auto size-8 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Одоогоор юу ч хадгалаагүй байна. Хотын хуудаснаас зүрх дарж эхлээрэй.
            </p>
          </div>
        ) : (
          <FolderGrid sections={sections} citySlugById={citySlugById} />
        )}
      </div>
    </div>
  )
}
