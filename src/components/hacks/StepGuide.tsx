"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { HackStep } from "@/data/hacks";

interface StepGuideProps {
  steps: HackStep[];
}

export const StepGuide = ({ steps }: StepGuideProps) => {
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}
          >
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-2xl font-black text-primary tracking-tight">{step.title}</h3>
              </div>
              <p className="text-muted-foreground text-xl leading-relaxed">
                {step.text}
              </p>
            </div>
            
            <div className="flex-1 w-full">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-secondary/5 shadow-2xl group"
              >
                <img
                  src={step.img}
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-6 right-6">
                   <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl">
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                   </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
