import { notFound } from "next/navigation"
import NextImage from "next/image"
import { ArrowLeft, ExternalLink, Gem, MapPin } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { PillBadge } from "@/components/ui/pill-badge"
import { GuideQuote } from "@/components/places/GuideQuote"
import { PlaceCard } from "@/components/places/PlaceCard"
import { PlaceMapStatic } from "@/components/places/PlaceMapStatic"
import { CATEGORY_LABEL } from "@/components/places/categoryLabels"
import { SaveHeart } from "@/components/saves/SaveHeart"
import type { CityRow, PlaceRow } from "@/lib/supabase/types"

const Image = NextImage as any

interface Props {
  params: Promise<{ slug: string; placeSlug: string }>
}

export default async function PlaceDetailPage({ params }: Props) {
  const { slug, placeSlug } = await params
  const supabase = await createClient()

  let { data: city } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .single<CityRow>()
  if (!city) {
    ;({ data: city } = await supabase.from("cities").select("*").eq("id", slug).single<CityRow>())
  }
  if (!city) notFound()

  const { data: place } = await supabase
    .from("places")
    .select("*")
    .eq("city_id", city.id)
    .eq("slug", placeSlug)
    .eq("published", true)
    .single<PlaceRow>()
  if (!place) notFound()

  const [{ data: recs }, { data: related }] = await Promise.all([
    supabase
      .from("place_recommendations")
      .select("id, quote, guides(id, name, image)")
      .eq("place_id", place.id),
    supabase
      .from("places")
      .select("*")
      .eq("city_id", city.id)
      .eq("category", place.category)
      .eq("published", true)
      .neq("id", place.id)
      .limit(3),
  ])

  const citySlug = city.slug ?? city.id

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-[36vh] md:h-[46vh] overflow-hidden bg-muted">
        {place.cover_image && (
          <Image src={place.cover_image} alt={place.name} fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <Link
          href={{ pathname: "/city/[slug]", params: { slug: citySlug } }}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 rounded-pill bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md hover:bg-white/30 transition-all"
        >
          <ArrowLeft className="size-4" /> {city.name}
        </Link>
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6 pb-6">
          <div className="mx-auto max-w-4xl">
            <p className="text-eyebrow !text-white/70">
              {(place.subcategory ?? CATEGORY_LABEL[place.category]).toUpperCase()}
              {place.neighborhood ? ` · ${place.neighborhood.toUpperCase()}` : ""}
            </p>
            <h1 className="mt-1 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              {place.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-6 py-10 space-y-10">
        {/* Badges + facts */}
        <div className="flex flex-wrap items-center gap-2">
          <SaveHeart itemType="place" itemId={place.id} withSheet className="border border-border" />
          <PillBadge variant="sky">{CATEGORY_LABEL[place.category]}</PillBadge>
          {place.is_hidden_gem && (
            <PillBadge variant="saffron">
              <Gem /> Нуугдмал эрдэнэ
            </PillBadge>
          )}
          {place.price_band ? (
            <PillBadge variant="sage">{"¥".repeat(place.price_band)}</PillBadge>
          ) : null}
          {place.neighborhood && (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {place.neighborhood}
            </span>
          )}
        </div>

        {/* Description */}
        {(place.long_desc ?? place.short_desc) && (
          <p className="text-lead">{place.long_desc ?? place.short_desc}</p>
        )}

        {/* Guide recommendations — the reason to trust this listing */}
        {(recs ?? []).length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(recs ?? []).map((rec: any) =>
              rec.guides ? (
                <GuideQuote key={rec.id} guide={rec.guides} quote={rec.quote} />
              ) : null
            )}
          </div>
        )}

        {/* Practical info + CTAs */}
        <div className="rounded-card border border-border bg-card p-6 space-y-4">
          {place.address && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Хаяг: </span>
              {place.address}
            </p>
          )}
          {place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map((tag) => (
                <span key={tag} className="rounded-pill bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            {place.booking_url && (
              <Button asChild variant="reserve" className="rounded-pill">
                <a href={place.booking_url} target="_blank" rel="noopener noreferrer">
                  Захиалах <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
            {/* The Azen unlock: point-to-point transfer to a saved place */}
            <Button asChild variant="outline" className="rounded-pill">
              <Link href="/transfer">Энд хүрэх трансфер захиалах</Link>
            </Button>
          </div>
        </div>

        {/* Map */}
        {place.lat != null && place.lng != null && (
          <PlaceMapStatic lat={place.lat} lng={place.lng} className="h-72" />
        )}

        {/* Related */}
        {(related ?? []).length > 0 && (
          <div className="space-y-4 border-t border-border pt-8">
            <h2 className="font-display text-xl font-bold text-foreground">
              Ойролцоох санал болгох газрууд
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(related ?? []).map((p: PlaceRow) => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  citySlug={citySlug}
                  categoryLabel={CATEGORY_LABEL[p.category]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
