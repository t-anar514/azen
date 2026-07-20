"use client"

import { Compass, Map, Search } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { RouteLine } from "@/components/ui/route-line"

interface HeroProps {
  placeCount: number
  guideCount: number
  cityCount: number
}

/**
 * Dual-path hero (design doc, Screen 01). Flight search is deliberately gone:
 * discovery and planning are the two pillars, so the hero asks which one you
 * want rather than assuming you've already decided to book a flight.
 */
export function Hero({ placeCount, guideCount, cityCount }: HeroProps) {
  const t = useTranslations("Hero")

  // the global ⌘K palette already listens on window — reuse it
  function openSearch() {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    )
  }

  return (
    <section className="relative flex flex-col items-center justify-center py-16 md:py-24 text-center overflow-hidden">
      <div className="container relative z-10 px-4 md:px-6 max-w-3xl">
        {/* Route eyebrow */}
        <div className="flex justify-center mb-8">
          <div className="w-48 md:w-64">
            <RouteLine from="Улаанбаатар" to="Токио" />
          </div>
        </div>

        {/* signature device: ink weight-800 + italic accent in brand blue */}
        <h1 className="text-display text-foreground mb-4 font-display">
          {t("title")} <br />
          <span className="italic text-primary">{t("subtitle")}</span>
        </h1>
        <p className="max-w-[620px] mx-auto text-lead">
          Нутгийн хөтчүүдийн санал болгосон газраар аялж, ухаалаг төлөвлөгчөөр өдрөө угсар.
          Нэг платформ дээр — нээ, төлөвлө, захиал.
        </p>

        {/* floating action panel: universal search + the two paths */}
        <div className="mt-10 rounded-card border border-border bg-card/80 p-3 shadow-lg backdrop-blur-sm">
          <button
            type="button"
            onClick={openSearch}
            className="flex w-full items-center gap-3 rounded-pill border border-border bg-background px-5 py-3.5 text-left transition-colors hover:bg-muted"
          >
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate text-sm text-muted-foreground">
              Хот, газар, нутгийн хөтөч хайх…
            </span>
            <kbd className="hidden shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:block">
              ⌘K
            </kbd>
          </button>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <PathCard
              href="/essentials"
              icon={Compass}
              tint="bg-tint-sky"
              title="Аялах хөтөч үзэх"
              description="Хот, газар, нутгийн хөтчөөр аяллаа эхлүүл"
            />
            <PathCard
              href="/planner"
              icon={Map}
              tint="bg-tint-saffron"
              title="Аялал төлөвлөх"
              description="Өдрийн төлөвлөгөө, төсөв, найзуудтайгаа"
            />
          </div>
        </div>

        {/* live counts — no invented numbers */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>
            <b className="font-semibold text-foreground">{placeCount}+</b> газар
          </span>
          <span aria-hidden>·</span>
          <span>
            <b className="font-semibold text-foreground">{guideCount}</b> нутгийн хөтөч
          </span>
          <span aria-hidden>·</span>
          <span>
            <b className="font-semibold text-foreground">{cityCount}</b> хот
          </span>
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/4 rounded-full blur-3xl -z-10" />
      <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-3xl -z-10" />
    </section>
  )
}

function PathCard({
  href,
  icon: Icon,
  tint,
  title,
  description,
}: {
  href: string
  icon: React.ElementType
  tint: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href as any}
      className="group flex items-start gap-3 rounded-thumb border border-border bg-background p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-well ${tint}`}>
        <Icon className="size-5 text-foreground/70" />
      </span>
      <span className="min-w-0">
        <span className="block font-display font-bold text-foreground group-hover:text-primary transition-colors">
          {title}
        </span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </Link>
  )
}
