import {
  BookOpen,
  Building2,
  CalendarRange,
  Car,
  Compass,
  GraduationCap,
  Map,
  Plane,
  Sparkles,
  UtensilsCrossed,
  Users,
  Wand2,
} from "lucide-react"

/**
 * The restructured IA (design doc "Azen Restructure" — New navigation).
 * Nine flat links collapse into two menus + Блог, so the two pillars of the
 * product — the travel guide and the trip planner — read as the top level.
 */
export interface NavItem {
  href: string
  label: string
  description: string
  icon: React.ElementType
}

export const GUIDE_MENU: NavItem[] = [
  { href: "/essentials", label: "Хотууд", description: "8 хотын дэлгэрэнгүй хөтөч", icon: Building2 },
  { href: "/city/tokyo-jp?tab=do", label: "Юу үзэх", description: "Үзвэр, музей, сүм дуган", icon: Compass },
  { href: "/city/tokyo-jp?tab=eat", label: "Хаана хооллох", description: "Рамен, суши, зах", icon: UtensilsCrossed },
  { href: "/guides", label: "Нутгийн хөтөч", description: "Баталгаажсан 40 хөтөч", icon: Users },
  { href: "/experiences", label: "Хэрэгцээт", description: "eSIM, JR Pass, бэлтгэл", icon: Sparkles },
  { href: "/learn", label: "Суралцах", description: "Япон хэлний суурь", icon: GraduationCap },
]

export const PLAN_MENU: NavItem[] = [
  { href: "/planner", label: "Аяллын төлөвлөгч", description: "Өдрөөр угсарч, төсвөө хуваа", icon: Map },
  { href: "/planner", label: "Жишиг хөтөлбөр", description: "Бэлэн загвараас эхлүүл", icon: CalendarRange },
  { href: "/tours/custom", label: "Захиалгат аялал", description: "4 асуулт — хувийн төлөвлөгөө", icon: Wand2 },
  { href: "/flights", label: "Хямд тийз", description: "Онцлох нислэгийн үнэ", icon: Plane },
  { href: "/transfer", label: "Хүргэх/Тосох", description: "Онгоцны буудлын тээвэр", icon: Car },
]

export const BLOG_ITEM = { href: "/blog", label: "Блог", icon: BookOpen }
