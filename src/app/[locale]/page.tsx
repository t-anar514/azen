import { Hero } from "@/components/home/Hero";
import { CategoryRail } from "@/components/home/CategoryRail";
import { CitiesGrid } from "@/components/home/CitiesGrid";
import { WhyAzen } from "@/components/home/WhyAzen";
import { FeaturedItinerary } from "@/components/home/FeaturedItinerary";
import { DiscoverGrid } from "@/components/home/DiscoverGrid";
import { MeetGuides } from "@/components/home/MeetGuides";
import { HowItWorks } from "@/components/home/HowItWorks";
import { NewsletterBand } from "@/components/home/NewsletterBand";
import { SupplyBanner } from "@/components/home/SupplyBanner";
import { setRequestLocale } from 'next-intl/server';
import { createClient } from "@/lib/supabase/server";
import type { PlaceRec } from "@/components/places/CityHub";
import type { CityRow, GuideRow, PlaceRow } from "@/lib/supabase/types";

export default async function Home({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const [{ data: cities }, { data: guides }, { data: places }] = await Promise.all([
    supabase.from("cities").select("*").eq("published", true).order("order_index", { ascending: true }).limit(8),
    supabase.from("guides").select("*").eq("is_active", true).order("rating", { ascending: false }).limit(6),
    supabase.from("places").select("*").eq("published", true).order("order_index", { ascending: true }),
  ]);

  const allPlaces = (places ?? []) as PlaceRow[];
  const cityRows = (cities ?? []) as CityRow[];
  const guideRows = (guides ?? []) as GuideRow[];

  const placeCountByCity: Record<string, number> = {};
  for (const place of allPlaces) {
    placeCountByCity[place.city_id] = (placeCountByCity[place.city_id] ?? 0) + 1;
  }
  const citySlugById = Object.fromEntries(cityRows.map((c) => [c.id, c.slug ?? c.id]));

  const featuredPlaces = [...allPlaces]
    .sort((a, b) => Number(b.is_hidden_gem) - Number(a.is_hidden_gem) || a.order_index - b.order_index)
    .slice(0, 8);

  const { data: recs } = featuredPlaces.length
    ? await supabase
        .from("place_recommendations")
        .select("id, place_id, quote, guides(id, name, image)")
        .in("place_id", featuredPlaces.map((p) => p.id))
    : { data: [] };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1 — dark dual-path hero */}
      <Hero
        placeCount={allPlaces.length}
        guideCount={guideRows.length}
        cityCount={cityRows.length}
      />

      {/* 2 — category chips */}
      <CategoryRail />

      {/* 3 — featured cities mosaic */}
      <CitiesGrid cities={cityRows} placeCountByCity={placeCountByCity} />

      {/* 4 — why azen (4 cards, dark 4th) */}
      <WhyAzen />

      {/* 5 — featured itinerary banner */}
      <FeaturedItinerary />

      {/* 6 — discover grid */}
      <DiscoverGrid
        places={featuredPlaces}
        recs={(recs ?? []) as unknown as PlaceRec[]}
        citySlugById={citySlugById}
      />

      {/* 7 — meet guides */}
      <MeetGuides guides={guideRows} />

      {/* 8 — how it works (dark process row) */}
      <HowItWorks />

      {/* 9 — green newsletter */}
      <NewsletterBand />

      {/* 10 — supply banners */}
      <SupplyBanner />
    </div>
  );
}
