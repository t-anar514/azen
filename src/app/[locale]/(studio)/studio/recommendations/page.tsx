import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getCurrentGuide } from "@/lib/guides/current"
import { guideFallbackPath } from "@/lib/studio/context"
import { loadGuideRecRows } from "@/lib/guides/stats"
import { RecsTable } from "@/components/studio/RecsTable"
import { Button } from "@/components/ui/button"

/** `/studio/recommendations` (Миний зөвлөмж) — the guide's full place list. */
export default async function StudioRecommendationsPage() {
  const ctx = await getCurrentGuide()
  if (!ctx) redirect(await guideFallbackPath())
  const { guide } = ctx
  const supabase = await createClient()

  const [recRows, { data: cityRows }] = await Promise.all([
    loadGuideRecRows(supabase, guide.id),
    supabase.from("cities").select("id,name"),
  ])
  const cityNameById = Object.fromEntries(
    (cityRows ?? []).map((c: { id: string; name: string }) => [c.id, c.name])
  )

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">Миний зөвлөмж</h1>
          <p className="mt-1 text-sm text-muted-foreground">Таны нэмсэн бүх газрын зөвлөмж.</p>
        </div>
        <Button asChild variant="message" className="rounded-pill">
          <Link href="/studio/new">
            <Plus className="size-[15px]" strokeWidth={2.4} /> Шинэ зөвлөмж
          </Link>
        </Button>
      </header>

      <RecsTable rows={recRows} cityNameById={cityNameById} />
    </div>
  )
}
