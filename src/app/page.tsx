import { Hero } from "@/components/home/Hero";
import { FeatureBlock } from "@/components/home/Features";
import { TrendingCarousel } from "@/components/home/TrendingCarousel";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeatureBlock />
      <TrendingCarousel />
    </div>
  );
}
