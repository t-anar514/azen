"use client";

import { Link } from "@/i18n/routing";
import { City } from "@/data/cities";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface CityCardProps {
  city: City;
}

export const CityCard = ({ city }: CityCardProps) => {
  const t = useTranslations("Essentials");
  const tData = useTranslations("Data.Cities");

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer"
    >
      <Link href={`/essentials/${city.id}` as any} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={city.heroImage}
            alt={city.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-2xl font-bold tracking-tight">{tData(`${city.id}.name`)}</h3>
          </div>
        </div>
        <div className="p-4 bg-card text-card-foreground">
          <p className="text-sm line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors">
            {tData(`${city.id}.teaser`)}
          </p>
          <div className="mt-4 flex items-center text-accent text-sm font-semibold">
            {t("exploreGuide")}
            <svg
              className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
