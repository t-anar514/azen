import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"
import { Star, MapPin, CheckCircle2, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RouteLine } from "@/components/ui/route-line"
import type { GuideRow } from "@/lib/supabase/types"
import NextImage from "next/image"
const Image = NextImage as any

interface FeaturedGuidesProps {
  guides: GuideRow[]
}

export async function FeaturedGuides({ guides }: FeaturedGuidesProps) {
  if (guides.length === 0) return null

  const t = await getTranslations("Guides")

  return (
    <section className="py-20">
      <div className="px-4 md:px-6 max-w-7xl mx-auto">
        {/* Section header — eyebrow + title + action, route-line divider */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Баталгаажсан хөтөч
            </span>
            <h2 className="mt-1.5 font-display text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              {t("title")}
            </h2>
            <p className="mt-2.5 text-lg text-muted-foreground">
              {t("subtitle", { count: guides.length })}
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full shrink-0 hidden sm:inline-flex">
            <Link href="/guides">
              Бүх хөтөчийг үзэх <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mb-10 max-w-2xl">
          <RouteLine />
        </div>

        {/* Guide spotlight grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href="/guides"
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              {/* Photo */}
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {guide.image ? (
                  <Image
                    src={guide.image}
                    alt={guide.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-display font-bold text-primary/30">
                    {guide.name[0]}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {guide.is_verified && (
                  <Badge variant="vetted" className="absolute left-3 top-3 gap-1 bg-white/95 backdrop-blur-sm">
                    <CheckCircle2 className="h-3 w-3" /> Шалгагдсан
                  </Badge>
                )}
                <Badge variant="rating" className="absolute right-3 top-3 gap-1 bg-white/95 backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-saffron-600 text-saffron-600" /> {guide.rating}
                </Badge>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1 text-white text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{guide.location}</span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold text-lg text-foreground leading-tight">
                    {guide.name}
                  </h3>
                  <div className="shrink-0 text-right">
                    <div className="font-display font-bold text-foreground">¥{guide.price ?? 0}</div>
                    <div className="text-xs text-muted-foreground">/{t("card.hour")}</div>
                  </div>
                </div>

                {guide.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2 italic">
                    &quot;{guide.bio}&quot;
                  </p>
                )}

                {guide.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                    {guide.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile "view all" */}
        <Button asChild variant="outline" className="rounded-full w-full mt-6 sm:hidden">
          <Link href="/guides">
            Бүх хөтөчийг үзэх <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
