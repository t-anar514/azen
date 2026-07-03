import { useTranslations } from "next-intl"
import { RouteLine } from "@/components/ui/route-line"
import { HeroSearch } from "./HeroSearch"

export function Hero() {
  const t = useTranslations("Hero")

  return (
    <section className="relative flex flex-col items-center justify-center py-16 md:py-28 text-center overflow-hidden">
      <div className="container relative z-10 px-4 md:px-6 max-w-3xl">
        {/* Route eyebrow */}
        <div className="flex justify-center mb-8">
          <div className="w-48 md:w-64">
            <RouteLine from="Улаанбаатар" to="Токио" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-4 font-display">
          {t("title")} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-500">
            {t("subtitle")}
          </span>
        </h1>
        <p className="max-w-[580px] mx-auto text-base md:text-lg text-muted-foreground mb-2">
          {t("description")}
        </p>

        {/* Where to + when search */}
        <HeroSearch />
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/4 rounded-full blur-3xl -z-10" />
      <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-3xl -z-10" />
    </section>
  )
}
