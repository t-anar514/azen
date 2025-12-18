"use client";

import { motion } from "framer-motion";

interface InfoSectionProps {
  title: string;
  text: string;
  imageUrl: string;
  imageAlt: string;
  reverse?: boolean;
}

export const InfoSection = ({ title, text, imageUrl, imageAlt, reverse = false }: InfoSectionProps) => {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center py-8`}>
      <div className="flex-1 space-y-4">
        <h3 className="text-2xl font-bold text-accent">{title}</h3>
        <p className="text-foreground/80 leading-relaxed text-lg">
          {text}
        </p>
      </div>
      <div className="flex-1 w-full">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative aspect-video md:aspect-[4/3] overflow-hidden rounded-2xl shadow-lg border border-secondary/20"
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </div>
  );
};
