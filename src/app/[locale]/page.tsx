import { Hero } from "@/components/home/Hero";
import { FeatureBlock } from "@/components/home/Features";
import { CustomTourSplit } from "@/components/home/CustomTourSplit";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CitiesGrid } from "@/components/home/CitiesGrid";
import { GuidesMosaic } from "@/components/home/GuidesMosaic";
import { FromTheBlog } from "@/components/home/FromTheBlog";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { LearnSection } from "@/components/home/LearnSection";
import { SAMPLE_ITINERARIES } from "@/data/templates";
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from "@/lib/supabase/server";
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
    supabase.from("places").select("id, city_id").eq("published", true),
  ]);

  // "12 газар" chips on the city cards
  const placeCountByCity: Record<string, number> = {};
  for (const place of (places ?? []) as Pick<PlaceRow, "id" | "city_id">[]) {
    placeCountByCity[place.city_id] = (placeCountByCity[place.city_id] ?? 0) + 1;
  }

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
      {/* 1 — hero */}
      <Hero />

      {/* 2 — discover / book / plan */}
      <FeatureBlock />

      {/* 3 — custom tour wizard shop window */}
      <CustomTourSplit />

      {/* 4 — 01 · 02 · 03 */}
      <HowItWorks />

      {/* 5 — cities, now pointing at the /city hubs */}
      <CitiesGrid cities={(cities ?? []) as CityRow[]} placeCountByCity={placeCountByCity} />

      {/* 6 — who our guides are + supply funnel */}
      <GuidesMosaic guides={guides ?? []} />

      {/* Sample itineraries — feeds the planner */}
      <HomeCarousel
        title={tItineraries("title")}
        description={tItineraries("description")}
        items={itineraryItems}
        aspectRatio="video"
        sectionClassName="bg-muted/30"
      />

      {/* 7 — latest posts */}
      <FromTheBlog posts={(posts ?? []) as PostRow[]} />

      {/* Japanese hub preview */}
      <LearnSection />
    </div>
  );
}
