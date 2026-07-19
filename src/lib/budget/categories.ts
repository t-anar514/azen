// Maps the planner's many ActivityType values onto the six budget categories
// (the icon-picker groups in TimelineItem.tsx) for the per-category cost
// breakdown. Pure derived UI data — no schema behind it.

export type BudgetCategory = "sights" | "food" | "transport" | "stay" | "shop" | "other"

export const BUDGET_CATEGORIES: { id: BudgetCategory; label: string; color: string }[] = [
  { id: "sights", label: "Үзвэр", color: "#f59e0b" },
  { id: "food", label: "Хоол", color: "#ef4444" },
  { id: "transport", label: "Тээвэр", color: "#0ea5e9" },
  { id: "stay", label: "Байр", color: "#8b5cf6" },
  { id: "shop", label: "Шоппинг", color: "#ec4899" },
  { id: "other", label: "Бусад", color: "#64748b" },
]

const TYPE_TO_CATEGORY: Record<string, BudgetCategory> = {
  // sights (incl. legacy types from older saved trips)
  spot: "sights", photo: "sights", landmark: "sights", castle: "sights",
  special: "sights", city: "sights", sightseeing: "sights", nature: "sights", culture: "sights",
  // food
  meal: "food", cafe: "food", pizza: "food", wine: "food", beer: "food",
  dessert: "food", food: "food", nightlife: "food",
  // transport
  train: "transport", flight: "transport", car: "transport", bus: "transport",
  tram: "transport", bike: "transport", transport: "transport",
  // stay
  hotel: "stay", house: "stay", camp: "stay", sleep: "stay",
  // shop
  shopping: "shop", market: "shop", gift: "shop", sale: "shop",
}

export function categoryOf(type: string): BudgetCategory {
  return TYPE_TO_CATEGORY[type] ?? "other"
}
