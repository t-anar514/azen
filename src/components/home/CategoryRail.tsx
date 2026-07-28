import {
  Compass,
  Landmark,
  Martini,
  Mountain,
  Palette,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  Waves,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

/**
 * Horizontal category chips under the hero (design doc, Screen 01).
 * Each chip deep-links into a city hub tab or a tag-filtered view.
 */
const CATEGORIES: { label: string; icon: React.ElementType; href: string }[] = [
  { label: "Юу үзэх", icon: Compass, href: "/city/tokyo-jp?tab=do" },
  { label: "Хаана хооллох", icon: UtensilsCrossed, href: "/city/tokyo-jp?tab=eat" },
  { label: "Шөнийн амьдрал", icon: Martini, href: "/city/tokyo-jp?tab=nightlife" },
  { label: "Сүм дуган", icon: Landmark, href: "/city/kyoto-jp?tab=do" },
  { label: "Онсэн", icon: Waves, href: "/city/beppu-jp?tab=do" },
  { label: "Шоппинг", icon: ShoppingBag, href: "/city/tokyo-jp?tab=do" },
  { label: "Байгаль", icon: Mountain, href: "/city/nagoya-jp?tab=do" },
  { label: "Соёл", icon: Palette, href: "/city/kyoto-jp?tab=do" },
  { label: "Фүжи", icon: Sparkles, href: "/essentials" },
]

/** Tinted tile colours cycle through the Eternal-Sky accent set (mobile). */
const TILE_TINTS = [
  "bg-tint-sky text-primary",
  "bg-tint-saffron text-saffron-600",
  "bg-tint-lilac text-lilac-600",
  "bg-tint-sage text-success",
]

export function CategoryRail() {
  return (
    <>
      {/* ── Mobile: tinted icon tiles (design doc, Screen 13) ── */}
      <div className="md:hidden">
        <div className="flex gap-2.5 overflow-x-auto px-5 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map(({ label, icon: Icon, href }, i) => (
            <Link
              key={label}
              href={href as any}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "flex size-14 items-center justify-center rounded-2xl",
                  TILE_TINTS[i % TILE_TINTS.length]
                )}
              >
                <Icon className="size-[22px]" strokeWidth={1.9} />
              </span>
              <span className="text-[11px] font-semibold text-[#475569]">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Desktop: horizontal pills (design doc, Screen 01) ── */}
      <section className="hidden border-y border-border bg-card/50 md:block">
        <div className="mx-auto max-w-content px-4 md:px-6">
          <div className="flex gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href as any}
                className="inline-flex shrink-0 items-center gap-2 rounded-pill border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-primary"
              >
                <Icon className="size-4 text-primary/70" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
