import { Folder } from "lucide-react"

import { PlaceCard } from "@/components/places/PlaceCard"
import { PostCard } from "@/components/blog/PostCard"
import { CATEGORY_LABEL } from "@/components/places/categoryLabels"
import { AddFolderToTripDialog } from "@/components/saves/AddFolderToTripDialog"
import type { PlaceRow, PostRow } from "@/lib/supabase/types"

export interface FolderSection {
  id: string | null
  name: string
  places: PlaceRow[]
  posts: PostRow[]
}

interface FolderGridProps {
  sections: FolderSection[]
  citySlugById: Record<string, string>
}

export function FolderGrid({ sections, citySlugById }: FolderGridProps) {
  return (
    <div className="space-y-12">
      {sections.map((section) => {
        const count = section.places.length + section.posts.length
        if (count === 0) return null
        return (
          <section key={section.id ?? "unfiled"} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
                <Folder className="size-5 text-primary" />
                {section.name}
                <span className="text-sm font-normal text-muted-foreground">({count})</span>
              </h2>
              <AddFolderToTripDialog folderName={section.name} places={section.places} />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {section.places.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  citySlug={citySlugById[place.city_id] ?? place.city_id}
                  categoryLabel={CATEGORY_LABEL[place.category]}
                />
              ))}
              {section.posts.map((post) => (
                <PostCard key={post.id} post={post} categoryLabel={post.category ?? undefined} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
