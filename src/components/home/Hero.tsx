import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ArrowRight, Map } from "lucide-react"

export function Hero() {
  const t = useTranslations("Hero")

  return (
    <section className="relative flex flex-col items-center justify-center py-20 md:py-32 text-center bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
      <div className="container relative z-10 px-4 md:px-6">
       
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-primary mb-8 animate-fade-in-up delay-100 font-serif">
          {t("title")} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic pr-2">
            {t("subtitle")}
          </span>
        </h1>
        <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200">
          {t("description")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
          {/* <Button asChild size="lg" className="rounded-full h-12 px-8 text-lg">
            <Link href="/guides">
              {t("findGuide")} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button> */}
          <Button asChild variant="outline" size="lg" className="rounded-full h-12 px-8 text-lg">
            <Link href="/planner">
              <Map className="mr-2 h-4 w-4" /> {t("startPlanning")}
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl -z-10" />
    </section>
  )
}
