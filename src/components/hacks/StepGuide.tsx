"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { HackStep } from "@/data/hacks";

import { useTranslations } from "next-intl";

interface StepGuideProps {
  steps: HackStep[];
  hackId: string;
}

export const StepGuide = ({ steps, hackId }: StepGuideProps) => {
  const t = useTranslations("Data.Hacks");

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-2 mb-8">
        <h2 className="text-2xl font-black text-primary uppercase italic tracking-tight">
          Step-by-Step Guide
        </h2>
        <div className="h-px flex-1 bg-secondary/20" />
      </div>

      <div className="grid gap-12">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-6 items-start"
          >
            <div className="flex flex-col items-center shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg border-4 border-white/50">
                {step.step}
              </div>
              {idx !== steps.length - 1 && (
                <div className="w-1 flex-1 bg-secondary/10 mt-4 rounded-full min-h-[4rem]" />
              )}
            </div>
            
            <div className="flex-1 pt-1 pb-12">
              <h3 className="text-2xl font-black text-primary tracking-tight mb-3">
                {t(`${hackId}.steps.${step.step}.title`)}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                {t(`${hackId}.steps.${step.step}.text`)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
