import { Eyebrow } from "@/components/ui/eyebrow"
import { ArrowLink } from "@/components/ui/arrow-link"
import { GuideDirectoryCard } from "@/components/guides/GuideDirectoryCard"
import type { GuideRow } from "@/lib/supabase/types"

/**
 * "Хөтчүүд" (design doc, Screen 01): eyebrow + title + "Бүх хөтөч →",
 * then a row of three guide cards (same compact card as the /guides directory).
 */
export function MeetGuides({ guides }: { guides: GuideRow[] }) {
  if (guides.length === 0) return null

  return (
    <section className="mx-auto max-w-content px-4 md:px-8 py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Хүнээс хүнд</Eyebrow>
          <h2 className="mt-2 font-display text-[34px] font-extrabold tracking-[-0.015em] text-foreground">
            Хөтчүүд
          </h2>
        </div>
        <ArrowLink href="/guides">Бүх хөтөч</ArrowLink>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {guides.slice(0, 3).map((guide) => (
          <GuideDirectoryCard key={guide.id} guide={guide} />
        ))}
      </div>
    </section>
  )
}
