"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { CityDetailSection } from "@/components/essentials/CityDetailSection";
import { TrainTip } from "@/components/essentials/TrainTip";
import { InfoSection } from "@/components/essentials/InfoSection";
import { DistrictCard } from "@/components/essentials/DistrictCard";
import { CategoryGrid } from "@/components/essentials/CategoryGrid";
import type { CityRow } from "@/lib/supabase/types";

export type InfoPanel = "overview" | "districts" | "transport" | "understand";

/**
 * The encyclopedia panels, content-only.
 *
 * These used to live in CityDetailTabs, which shipped its own hero and its own
 * sticky tab bar — so embedding it inside the city hub rendered two heroes and
 * two tab rows on the same page. The restructure keeps one hero and one tab bar
 * in CityHub and drops just the panel body in here.
 */
export function CityInfoPanels({ city, panel }: { city: CityRow; panel: InfoPanel }) {
  const t = useTranslations("EssentialsPage.detail");

  if (panel === "overview") {
    return (
      <div className="mx-auto max-w-4xl">
        <CityDetailSection title={t("sections.welcome", { name: city.name })}>
          <p className="text-xl leading-relaxed text-foreground/80 font-medium">
            {city.introduction}
          </p>
          <CategoryGrid />
        </CityDetailSection>
      </div>
    );
  }

  if (panel === "districts") {
    return (
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sticky map */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-28 lg:h-[calc(100vh-9rem)]">
          <div className="relative h-full min-h-[400px] overflow-hidden rounded-card border border-border shadow-lg bg-card group">
            <img
              src={city.districts.mapUrl}
              alt={`${city.name} map overview`}
              className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/15 to-transparent pointer-events-none" />
            <div className="absolute top-6 left-6">
              <span className="rounded-pill bg-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
                {t("sections.areaGuide")}
              </span>
            </div>
          </div>
        </div>

        {/* District cards */}
        <div className="w-full lg:w-1/2">
          <div className="mb-8 space-y-2">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              {t("sections.districts")}
            </h2>
            <div className="h-1 w-20 rounded-full bg-primary" />
          </div>
          <div className="grid gap-6 sm:grid-cols-1 xl:grid-cols-2">
            {city.districts.list?.map((district, index) => (
              <DistrictCard key={district.id} district={district} index={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (panel === "transport") {
    return (
      <div className="mx-auto max-w-4xl">
        <CityDetailSection title={t("sections.navigating")}>
          <TrainTip />
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">{city.getting_around}</p>
          </div>
        </CityDetailSection>
      </div>
    );
  }

  // understand — history, culture, costs, climate, vibe
  return (
    <div className="mx-auto max-w-4xl space-y-4 divide-y divide-border">
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
          <div className="mt-6 overflow-hidden rounded-xl border border-border shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="border-b border-border px-4 py-3">Tier</th>
                  <th className="border-b border-border px-4 py-3">Est. Daily</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {city.expenses.tiers.map((tier, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-muted/50">
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
            <div
              key={idx}
              className="rounded-thumb border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30"
            >
              <div className="mb-1 text-sm font-bold uppercase tracking-wide text-accent">
                {season.name}
              </div>
              <div className="mb-1 text-xl font-bold">{season.temp}</div>
              <div className="text-xs italic text-muted-foreground">{season.vibe}</div>
            </div>
          ))}
        </div>
      </InfoSection>

      <div className="py-12">
        <div className="group relative overflow-hidden rounded-card border border-border bg-muted/30">
          <img
            src={city.vibe.imageUrl}
            alt={`${city.name} vibe`}
            className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity duration-700 group-hover:opacity-30"
          />
          <div className="relative space-y-4 p-12 text-center">
            <Sparkles className="mx-auto mb-2 size-12 text-primary opacity-50" />
            <p className="mx-auto max-w-lg font-serif text-2xl italic leading-tight text-primary md:text-3xl">
              &ldquo;{city.vibe.text}&rdquo;
            </p>
            <div className="mx-auto h-1 w-12 rounded-full bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
