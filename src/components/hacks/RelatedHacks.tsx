"use client";

import { Hack } from "@/data/hacks";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface RelatedHacksProps {
  hacks: Hack[];
}

export const RelatedHacks = ({ hacks }: RelatedHacksProps) => {
  if (hacks.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-primary uppercase italic tracking-tight">
          Suggested Reading
        </h2>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x">
        {hacks.map((hack) => (
          <Link
            key={hack.id}
            href={`/hacks/${hack.id}`}
            className="group min-w-[280px] md:min-w-[320px] snap-start"
          >
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-card rounded-2xl overflow-hidden border border-secondary/10 shadow-sm hover:shadow-md transition-all h-full"
            >
              <div className="relative aspect-[16/10]">
                <img
                  src={hack.coverImage}
                  alt={hack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className="absolute top-3 left-3">
                   <span className="bg-accent text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {hack.category}
                   </span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-primary group-hover:text-accent transition-colors line-clamp-1">
                  {hack.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {hack.summary}
                </p>
                <div className="flex items-center gap-1 text-xs font-bold text-accent pt-1">
                  Learn More <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};
