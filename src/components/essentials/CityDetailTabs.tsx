"use client";

import { useState } from "react";
import Link from "next/link";
import { CityDetailSection } from "@/components/essentials/CityDetailSection";
import { TrainTip } from "@/components/essentials/TrainTip";
import { ArrowLeft, MapPin, Train, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InfoSection } from "@/components/essentials/InfoSection";
import { DistrictCard } from "@/components/essentials/DistrictCard";
import { useTranslations } from "next-intl";
import { CategoryGrid } from "@/components/essentials/CategoryGrid";
import type { CityRow } from "@/lib/supabase/types";

type TabType = "introduction" | "districts" | "transport" | "understand";

export function CityDetailTabs({ city }: { city: CityRow }) {
  const [activeTab, setActiveTab] = useState<TabType>("introduction");
  const t = useTranslations("EssentialsPage.detail");

  const tabs = [
    { id: "introduction", label: t("tabs.introduction"), icon: Info },
    { id: "districts", label: t("tabs.districts"), icon: MapPin },
    { id: "transport", label: t("tabs.transport"), icon: Train },
    { id: "understand", label: t("tabs.understand"), icon: Sparkles },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={city.hero_image ?? undefined}
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
          {t("back")}
        </Link>
      </div>

      {/* Main Content */}
      <div className={`mx-auto py-8 transition-all duration-500 ${activeTab === "districts" ? "w-full px-4 md:px-12" : "max-w-4xl px-4"}`}>
        {/* Navigation Tabs */}
        <div className={`flex flex-wrap gap-2 border-b border-secondary/20 mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-20 py-4 ${activeTab === "districts" ? "px-0" : ""}`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-2 px-4 rounded-full transition-all text-sm font-semibold ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-white/50 text-foreground hover:bg-secondary/10"
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
            className="w-full"
          >
            {activeTab === "introduction" && (
              <CityDetailSection title={t("sections.welcome", { name: city.name })}>
                <p className="text-xl leading-relaxed text-foreground/80 font-medium">{city.introduction}</p>
                <CategoryGrid />
              </CityDetailSection>
            )}

            {activeTab === "districts" && (
              <div className="w-full">
                <div className="flex flex-col lg:flex-row gap-12">
                  {/* Left Side: Sticky Map */}
                  <div className="w-full lg:w-1/2 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
                    <div className="relative h-full min-h-[400px] overflow-hidden rounded-3xl border border-secondary/20 shadow-2xl bg-white/30 backdrop-blur-sm group">
                      <img
                        src={city.districts.mapUrl}
                        alt={`${city.name} map overview`}
                        className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
                      <div className="absolute top-6 left-6">
                        <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-lg">
                          {t("sections.areaGuide")}
                        </span>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block">
                        <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Interactive Area Map</p>
                        <p className="text-sm font-medium text-foreground">Click a district to zoom and discover deep local secrets.</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Scrollable Bento Grid */}
                  <div className="w-full lg:w-1/2">
                    <div className="mb-10 space-y-2">
                      <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">
                        {t("sections.districts")}
                      </h2>
                      <div className="h-1 w-20 bg-primary rounded-full" />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-1 xl:grid-cols-2">
                      {city.districts.list.map((district, idx) => (
                        <DistrictCard key={district.id} district={district} index={idx} />
                      ))}
                    </div>

                    <div className="mt-16 p-8 rounded-3xl border border-dashed border-border/40 bg-muted/5 text-center">
                      <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium text-foreground/50 italic">
                        More micro-neighborhoods being mapped by our local guides...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "transport" && (
              <CityDetailSection title={t("sections.navigating")}>
                <TrainTip />
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">{city.getting_around}</p>
                </div>
              </CityDetailSection>
            )}

            {activeTab === "understand" && (
              <div className="space-y-4 divide-y divide-secondary/10">
                <InfoSection
                  title={t("sections.history")}
                  text={city.history.text}
                  imageUrl={city.history.imageUrl}
                  imageAlt={`${city.name} history`}
                  reverse
                />

                <InfoSection
                  title={t("sections.culture")}
                  text={city.culture.text}
                  imageUrl={city.culture.imageUrl}
                  imageAlt={`${city.name} culture`}
                />

                <InfoSection
                  title={t("sections.costs")}
                  text={city.expenses.text}
                  imageUrl={city.expenses.imageUrl}
                  imageAlt={`${city.name} expenses`}
                  reverse
                >
                  {!!city.expenses.tiers?.length && (
                    <div className="mt-6 overflow-hidden rounded-xl border border-secondary/20 shadow-sm transition-all hover:shadow-md">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/5 text-secondary-foreground font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3 border-b border-secondary/10">Tier</th>
                            <th className="px-4 py-3 border-b border-secondary/10">Est. Daily</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/5">
                          {city.expenses.tiers.map((tier, idx) => (
                            <tr key={idx} className="hover:bg-accent/5 transition-colors">
                              <td className="px-4 py-3 font-medium">{tier.category}</td>
                              <td className="px-4 py-3">{tier.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </InfoSection>

                <InfoSection
                  title={t("sections.climate")}
                  text={city.climate.text}
                  imageUrl={city.climate.imageUrl}
                  imageAlt={`${city.name} climate`}
                >
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {city.climate.seasons?.map((season, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 hover:border-accent/30 transition-all hover:translate-y-[-2px]">
                        <div className="font-bold text-accent text-sm uppercase tracking-wide mb-1">{season.name}</div>
                        <div className="text-xl font-bold mb-1">{season.temp}</div>
                        <div className="text-xs text-muted-foreground italic">{season.vibe}</div>
                      </div>
                    ))}
                  </div>
                </InfoSection>

                <div className="py-12">
                  <div className="relative overflow-hidden rounded-3xl bg-secondary/5 border border-secondary/10 group">
                    <img
                      src={city.vibe.imageUrl}
                      alt={`${city.name} vibe`}
                      className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-700"
                    />
                    <div className="relative p-12 text-center space-y-4">
                      <Sparkles className="w-12 h-12 text-primary mx-auto mb-2 opacity-50" />
                      <p className="text-2xl md:text-3xl italic font-serif text-primary leading-tight max-w-lg mx-auto">
                        "{city.vibe.text}"
                      </p>
                      <div className="w-12 h-1 bg-primary/20 mx-auto rounded-full" />
                    </div>
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
