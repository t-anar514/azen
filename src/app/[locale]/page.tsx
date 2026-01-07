import { Hero } from "@/components/home/Hero";
import { FeatureBlock } from "@/components/home/Features";
import { TrendingCarousel } from "@/components/home/TrendingCarousel";
import { SampleItineraries } from "@/components/home/SampleItineraries";
import { setRequestLocale } from 'next-intl/server';

export default async function Home({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeatureBlock />
      <SampleItineraries />
       <TrendingCarousel /> 
    </div>
  );
}
