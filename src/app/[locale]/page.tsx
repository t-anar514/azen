import { Hero } from "@/components/home/Hero";
import { CategoryRail } from "@/components/home/CategoryRail";
import { FeatureBlock } from "@/components/home/Features";
import { CitiesGrid } from "@/components/home/CitiesGrid";
import { CustomTourSplit } from "@/components/home/CustomTourSplit";
import { DiscoverGrid } from "@/components/home/DiscoverGrid";
import { GuidesMosaic } from "@/components/home/GuidesMosaic";
import { HowItWorks } from "@/components/home/HowItWorks";
import { NewsletterBand } from "@/components/home/NewsletterBand";
import { FromTheBlog } from "@/components/home/FromTheBlog";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { SAMPLE_ITINERARIES } from "@/data/templates";
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from "@/lib/supabase/server";
import type { PlaceRec } from "@/components/places/CityHub";
import type { CityRow, PlaceRow, PostRow } from "@/lib/supabase/types";

export default async function Home({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const tItineraries = await getTranslations("SampleItineraries");

  const supabase = await createClient();
  const [{ data: posts }, { data: cities }, { data: guides }, { data: places }] = await Promise.all([
    supabase.from("posts").select("*").eq("published", true).order("published_at", { ascending: false }).limit(3),
    supabase.from("cities").select("*").eq("published", true).order("order_index", { ascending: true }).limit(8),
    supabase.from("guides").select("*").eq("is_active", true).order("rating", { ascending: false }).limit(6),
    supabase.from("places").select("*").eq("published", true).order("order_index", { ascending: true }),
  ]);

  const allPlaces = (places ?? []) as PlaceRow[];
  const cityRows = (cities ?? []) as CityRow[];

  // "N газар" chips on the city tiles
  const placeCountByCity: Record<string, number> = {};
  for (const place of allPlaces) {
    placeCountByCity[place.city_id] = (placeCountByCity[place.city_id] ?? 0) + 1;
  }
  const citySlugById = Object.fromEntries(cityRows.map((c) => [c.id, c.slug ?? c.id]));

  // discover rail: hidden gems first, then curated order
  const featuredPlaces = [...allPlaces]
    .sort((a, b) => Number(b.is_hidden_gem) - Number(a.is_hidden_gem) || a.order_index - b.order_index)
    .slice(0, 8);

  const { data: recs } = featuredPlaces.length
    ? await supabase
        .from("place_recommendations")
        .select("id, place_id, quote, guides(id, name, image)")
        .in("place_id", featuredPlaces.map((p) => p.id))
    : { data: [] };

  const itineraryItems = SAMPLE_ITINERARIES.map(item => ({
    id: item.id,
    image: item.heroImage,
    title: tItineraries(`${item.id}.title`),
    description: tItineraries(`${item.id}.summary`),
    badge: `${item.duration} ${item.duration === 1 ? tItineraries('day') : tItineraries('days')}`,
    link: { pathname: '/planner', query: { template: item.id } },
    footerLeft: tItineraries('estimatedFrom'),
    footerRight: `¥${item.basePrice.toLocaleString()}`
  }));

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1 — dual-path hero (no flight search) */}
      <Hero
        placeCount={allPlaces.length}
        guideCount={(guides ?? []).length}
        cityCount={cityRows.length}
      />

      {/* 2 — category chips */}
      <CategoryRail />

      {/* 3 — cities mosaic */}
      <CitiesGrid cities={cityRows} placeCountByCity={placeCountByCity} />

      {/* 4 — why azen */}
      <FeatureBlock />

      {/* 5 — featured itineraries */}
      <HomeCarousel
        title={tItineraries("title")}
        description={tItineraries("description")}
        items={itineraryItems}
        aspectRatio="video"
        sectionClassName="bg-muted/30"
      />

      {/* 6 — discover grid */}
      <DiscoverGrid
        places={featuredPlaces}
        recs={(recs ?? []) as unknown as PlaceRec[]}
        citySlugById={citySlugById}
      />

      {/* 7 — guides + supply funnel */}
      <GuidesMosaic guides={guides ?? []} />

      {/* 8 — custom tour wizard */}
      <CustomTourSplit />

      {/* 9 — 01 · 02 · 03 */}
      <HowItWorks />

      {/* 10 — latest posts */}
      <FromTheBlog posts={(posts ?? []) as PostRow[]} />

      {/* 11 — newsletter */}
      <NewsletterBand />
    </div>
  );
}
