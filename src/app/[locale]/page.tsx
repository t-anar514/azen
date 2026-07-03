import { Hero } from "@/components/home/Hero";
import { FeatureBlock } from "@/components/home/Features";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { FeaturedGuides } from "@/components/home/FeaturedGuides";
import { LearnSection } from "@/components/home/LearnSection";
import { SAMPLE_ITINERARIES } from "@/data/templates";
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from "@/lib/supabase/server";

export default async function Home({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const tHacks = await getTranslations("Hacks");
  const tEssentials = await getTranslations("Essentials");
  const tLearn = await getTranslations("Learn");
  const tItineraries = await getTranslations("SampleItineraries");

  const supabase = await createClient();
  const [{ data: hacks }, { data: cities }, { data: guides }] = await Promise.all([
    supabase.from("hacks").select("*").eq("published", true).order("order_index", { ascending: true }).limit(8),
    supabase.from("cities").select("*").eq("published", true).order("order_index", { ascending: true }).limit(8),
    supabase.from("guides").select("*").eq("is_active", true).order("rating", { ascending: false }).limit(3),
  ]);

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

  const hackItems = (hacks ?? []).map(hack => ({
    id: hack.id,
    image: hack.cover_image,
    title: hack.title,
    description: hack.summary,
    badge: tHacks(`categories.${hack.category}`),
    category: hack.category,
    link: `/hacks/${hack.id}`
  }));

  const cityItems = (cities ?? []).map(city => ({
    id: city.id,
    image: city.hero_image,
    title: city.name,
    description: city.teaser,
    badge: "Хот",
    link: `/essentials/${city.id}`
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeatureBlock />

      {/* Featured Guides — spotlight from /guides */}
      <FeaturedGuides guides={guides ?? []} />

      {/* Sample Itineraries Carousel */}
      <HomeCarousel 
        title={tItineraries("title")}
        description={tItineraries("description")}
        items={itineraryItems}
        aspectRatio="video"
        sectionClassName="bg-muted/30"
      />

      {/* Travel Hacks Carousel */}
      <HomeCarousel 
        title={tHacks("title")}
        description={tHacks("description")}
        items={hackItems}
        aspectRatio="video"
      />

      {/* City Essentials Carousel */}
      <HomeCarousel 
        title={tEssentials("title")}
        description={tEssentials("description")}
        items={cityItems}
        aspectRatio="portrait"
        cardWidth="w-[240px] md:w-[300px] lg:w-[350px]"
        sectionClassName="bg-muted/30"
      />

      {/* Interactive Japanese Hub Preview */}
      <LearnSection />
    </div>
  );
}

