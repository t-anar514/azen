"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { CITIES } from "@/data/cities";
import { CityDetailSection } from "@/components/essentials/CityDetailSection";
import { TrainTip } from "@/components/essentials/TrainTip";
import { ArrowLeft, MapPin, Train, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InfoSection } from "@/components/essentials/InfoSection";

type TabType = "introduction" | "districts" | "transport" | "understand";

export default function CityDetailPage() {
  const params = useParams();
  const city = CITIES.find((c) => c.id === params.id);
  const [activeTab, setActiveTab] = useState<TabType>("introduction");

  if (!city) {
    notFound();
  }

  const tabs = [
    { id: "introduction", label: "Introduction", icon: Info },
    { id: "districts", label: "Districts", icon: MapPin },
    { id: "transport", label: "Getting Around", icon: Train },
    { id: "understand", label: "Understand", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={city.heroImage}
          alt={city.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white space-y-4 px-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
              {city.name}
            </h1>
            <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-90">
              {city.teaser}
            </p>
          </div>
        </div>
        <Link
          href="/essentials"
          className="absolute top-6 left-6 flex items-center gap-2 py-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all z-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cities
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-secondary/20 mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-2 px-4 rounded-full transition-all text-sm font-semibold ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-surface text-foreground hover:bg-secondary/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >

            {activeTab === "introduction" && (
              <CityDetailSection title={`Welcome to ${city.name}`}>
                <p className="text-lg leading-relaxed">{city.introduction}</p>
              </CityDetailSection>
            )}

            {activeTab === "districts" && (
              <CityDetailSection title="Key Districts to Explore">
                <div className="space-y-8">
                  <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-secondary/20 shadow-lg">
                    <img 
                      src={city.districts.mapUrl} 
                      alt={`${city.name} Map Overview`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <span className="bg-accent text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                        Area Guide
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {city.districts.list.map((district, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ y: -2 }}
                        className="p-6 rounded-xl border border-secondary/10 bg-card hover:border-accent/40 transition-colors"
                      >
                        <h3 className="text-xl font-bold text-accent mb-2">{district.name}</h3>
                        <p className="text-muted-foreground leading-relaxed">{district.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CityDetailSection>
            )}

            {activeTab === "transport" && (
              <CityDetailSection title="Navigating the City">
                <TrainTip />
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">{city.gettingAround}</p>
                </div>
              </CityDetailSection>
            )}

            {activeTab === "understand" && (
              <div className="space-y-4 divide-y divide-secondary/10">
                <InfoSection 
                  title="History & Significance" 
                  text={city.history.text} 
                  imageUrl={city.history.imageUrl} 
                  imageAlt={`${city.name} History`}
                  reverse
                />

                <InfoSection 
                  title="Culture & Traditions" 
                  text={city.culture.text} 
                  imageUrl={city.culture.imageUrl} 
                  imageAlt={`${city.name} Culture`}
                />

                <InfoSection 
                  title="Cost of Travel" 
                  text={city.expenses.text} 
                  imageUrl={city.expenses.imageUrl} 
                  imageAlt={`${city.name} Expenses`}
                  reverse
                />

                <InfoSection 
                  title="Climate & Seasons" 
                  text={city.climate.text} 
                  imageUrl={city.climate.imageUrl} 
                  imageAlt={`${city.name} Climate`}
                />

                <div className="py-8">
                  <div className="p-8 rounded-2xl bg-primary/5 border-2 border-dashed border-primary/20 text-center">
                    <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-xl italic font-serif text-primary">
                      "{city.vibe}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
