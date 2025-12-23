"use client";

import { useParams, notFound } from "next/navigation";
import { HACKS } from "@/data/hacks";
import { HackHero } from "@/components/hacks/HackHero";
import { QuickFix } from "@/components/hacks/QuickFix";
import { StepGuide } from "@/components/hacks/StepGuide";
import { ProTip } from "@/components/hacks/ProTip";
import { RelatedHacks } from "@/components/hacks/RelatedHacks";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function HackDetailPage() {
  const params = useParams();
  const hack = HACKS.find((h) => h.id === params.id);
  const tData = useTranslations("Data.Hacks");

  if (!hack) {
    notFound();
  }

  const relatedHacks = HACKS.filter((h) => hack.relatedIds.includes(h.id));

  return (
    <div className="min-h-screen bg-background">
      <HackHero
        title={tData(`${hack.id}.title`)}
        category={hack.category}
        coverImage={hack.coverImage}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-20">
        <section>
          <QuickFix summary={tData(`${hack.id}.summary`)} />
        </section>

        <section>
          <StepGuide steps={hack.steps} hackId={hack.id} />
        </section>

        <section>
          <ProTip text={tData(`${hack.id}.proTip`)} />
        </section>

        <section className="pt-10 border-t border-secondary/10">
          <RelatedHacks hacks={relatedHacks} />
        </section>
      </div>

      <footer className="bg-surface py-12 px-4 border-t border-secondary/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h4 className="text-primary font-bold uppercase tracking-widest text-sm">
            Azen Travel Hacks
          </h4>
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} Azen Travel Guide. Master Japan like a local.
          </p>
        </div>
      </footer>
    </div>
  );
}
