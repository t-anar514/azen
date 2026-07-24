import { redirect } from "next/navigation"

import { getCurrentGuide } from "@/lib/guides/current"
import { ProfileEditForm } from "@/components/studio/ProfileEditForm"

/**
 * `/studio/profile` — lets a guide edit their public-profile presentation
 * (avatar, cover, bio, tags, location, hourly rate, intro video). Feeds the
 * completeness checklist on the dashboard and the public `/guides/[slug]`.
 */
export default async function StudioProfilePage() {
  const ctx = await getCurrentGuide()
  if (!ctx) redirect("/guides/apply")
  const { guide } = ctx

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">Профайл засах</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Эдгээр мэдээлэл таны нийтийн хөтчийн профайл дээр харагдана.
        </p>
      </header>

      <ProfileEditForm guide={guide} />
    </div>
  )
}
