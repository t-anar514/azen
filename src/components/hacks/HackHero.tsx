"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge"; // Assuming this exists based on common shadcn pattern or I can create a simple one
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HackHeroProps {
  title: string;
  category: string;
  coverImage: string;
}

export const HackHero = ({ title, category, coverImage }: HackHeroProps) => {
  return (
    <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
      <img
        src={coverImage}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="inline-block px-3 py-1 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest leading-none">
            {category}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
            {title}
          </h1>
        </motion.div>
      </div>
      <Link
        href="/hacks"
        className="absolute top-6 left-6 flex items-center gap-2 py-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all z-10 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Hacks
      </Link>
    </div>
  );
};
