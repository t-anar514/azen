"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { District } from "@/data/cities";

interface DistrictCardProps {
  district: District;
  index: number;
}

export function DistrictCard({ district, index }: DistrictCardProps) {
  const t = useTranslations("Data.Districts.categories");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        y: -4,
        boxShadow: "0 10px 30px -10px rgba(28, 49, 94, 0.1)",
        borderColor: "var(--secondary)" 
      }}
      className="group relative bg-[#fcfaf2] border border-[#e6e2c3] rounded-2xl p-6 transition-all duration-300 flex flex-col gap-4 cursor-pointer"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-xl font-bold text-[#1c315e] leading-tight group-hover:text-[#227c70] transition-colors">
          {district.name}
        </h3>
      </div>
      
      <p className="text-[#1c315e]/70 text-sm leading-relaxed line-clamp-3">
        {district.description}
      </p>

      <div className="mt-auto pt-2 flex items-center gap-2 text-[10px] font-bold text-[#227c70] opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300">
        <span>EXPLORE AREA</span>
        <svg 
          className="w-3 h-3 transition-transform group-hover:translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </motion.div>
  );
}
