"use client";

import { useTranslations } from "next-intl";

export const CategoryGrid = () => {
  const t = useTranslations("CityCategories");

  const categories = [
    { id: "restaurants", emoji: "🍽️" },
    { id: "attractions", emoji: "📍" },
    { id: "cafes", emoji: "☕" },
    { id: "photoSpots", emoji: "📸" },
    { id: "cheapEats", emoji: "🤑" },
    { id: "breakfast", emoji: "🍳" },
    { id: "bakeries", emoji: "🥐" },
    { id: "beer", emoji: "🍺" },
    { id: "romantic", emoji: "❤️" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-10">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-secondary/20 text-left group"
        >
          <span className="text-2xl group-hover:scale-125 transition-transform duration-300 transform-gpu">{cat.emoji}</span>
          <span className="font-bold text-[#1c315e] text-sm md:text-base">{t(cat.id)}</span>
        </button>
      ))}
    </div>
  );
};
