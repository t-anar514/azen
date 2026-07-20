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

export function CategoryRail() {
  return (
    <section className="border-y border-border bg-card/50">
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
  )
}
