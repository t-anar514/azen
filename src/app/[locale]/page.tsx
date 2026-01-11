import { Hero } from "@/components/home/Hero";
import { FeatureBlock } from "@/components/home/Features";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { LearnSection } from "@/components/home/LearnSection";
import { HACKS } from "@/data/hacks";
import { CITIES } from "@/data/cities";
import { SAMPLE_ITINERARIES } from "@/data/templates";
import { setRequestLocale, getTranslations } from 'next-intl/server';

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
  const tData = await getTranslations("Data");
  const tItineraries = await getTranslations("SampleItineraries");

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

  const hackItems = HACKS.map(hack => ({
    id: hack.id,
    image: hack.coverImage,
    title: tData(`Hacks.${hack.id}.title`),
    description: tData(`Hacks.${hack.id}.summary`),
    badge: tHacks(`categories.${hack.category}`),
    category: hack.category,
    link: `/hacks#${hack.id}`
  }));

  const cityItems = CITIES.map(city => ({
    id: city.id,
    image: city.heroImage,
    title: tData(`Cities.${city.id}.name`),
    description: tData(`Cities.${city.id}.teaser`),
    badge: "Хот",
    link: "/essentials"
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeatureBlock />
      
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

