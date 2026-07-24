import Link from "next/link"
import { MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { CATEGORY_LABEL } from "@/components/places/categoryLabels"
import { cn } from "@/lib/utils"
import type { GuideRecRow } from "@/lib/guides/stats"
import type { PlaceCategory } from "@/lib/supabase/types"

/** Decorative colour tiles, cycled by row index — places don't carry a stored
 *  colour, so this mirrors the mockup's varied gradients without new data. */
export const TILE_GRADIENTS = [
  "from-[#2A1745] to-[#5F58AD]",
  "from-[#C9761E] to-saffron",
  "from-[#14532D] to-success",
  "from-[#7A2E2E] to-[#C2483B]",
] as const

interface RecsTableProps {
  rows: GuideRecRow[]
  cityNameById: Record<string, string>
}

/**
 * "Миний зөвлөмжүүд" table (design doc, Screen 09/10 desktop). This is the
 * desktop-shaped presentation (ГАЗАР/ҮЗЭЛТ/ХАДГАЛСАН/ТӨЛӨВ columns) — the
 * dashboard page renders it only inside its `hidden md:block` section and
 * uses a separate compact list for the mobile Studio screen, since the
 * mobile mockup's row content genuinely differs (combined "views · saves"
 * text, no city/category line) rather than just hiding columns.
 */
export function RecsTable({ rows, cityNameById }: RecsTableProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-display text-base font-bold">Миний зөвлөмжүүд</h2>
        <Link href="/studio/recommendations" className="text-[13px] font-semibold text-primary">
          Бүгд харах →
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">Одоогоор зөвлөмж алга.</p>
          <Link
            href="/studio/new"
            className="rounded-pill bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Эхний зөвлөмжөө нэмэх
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1.8fr_.7fr_.7fr_.7fr_auto] gap-2 border-b border-border bg-muted/40 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <span>Газар</span>
            <span className="text-right">Үзэлт</span>
            <span className="text-right">Хадгалсан</span>
            <span className="text-center">Төлөв</span>
            <span className="sr-only">Үйлдэл</span>
          </div>
          <div>
            {rows.map((r, i) => (
              <div
                key={r.id}
                className="grid grid-cols-[1.8fr_.7fr_.7fr_.7fr_auto] items-center gap-2 border-b border-border/60 px-5 py-3 text-[13.5px] last:border-b-0"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={cn(
                      "size-10 shrink-0 rounded-thumb bg-gradient-to-br",
                      TILE_GRADIENTS[i % TILE_GRADIENTS.length]
                    )}
                  />
                  <span className="min-w-0">
                    <b className="block truncate text-foreground">{r.name}</b>
                    <span className="text-[11.5px] text-muted-foreground">
                      {cityNameById[r.city_id] ?? "—"} · {CATEGORY_LABEL[r.category as PlaceCategory] ?? r.category}
                    </span>
                  </span>
                </span>
                <span className="text-right font-semibold text-foreground/80">
                  {r.published ? r.views.toLocaleString("mn-MN") : "—"}
                </span>
                <span className="text-right font-semibold text-foreground/80">
                  {r.published ? r.saves.toLocaleString("mn-MN") : "—"}
                </span>
                <span className="flex justify-center">
                  <Badge variant={r.published ? "confirmed" : "pending"}>
                    {r.published ? "Нийтэлсэн" : "Ноорог"}
                  </Badge>
                </span>
                <Link
                  href={`/studio/new?id=${r.id}`}
                  aria-label={`${r.name} — засах`}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="size-[18px]" />
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
