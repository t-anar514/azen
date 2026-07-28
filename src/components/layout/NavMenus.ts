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
  { href: "/guides", label: "Хөтөч", description: "Баталгаажсан хөтөчүүд", icon: Users },
  { href: "/learn", label: "Суралцах", description: "Аялалын япон хэл", icon: GraduationCap },
]

export const PLAN_MENU: NavItem[] = [
  { href: "/planner", label: "Аяллын төлөвлөгч", description: "Өдрөөр бүтээж, төсвөө хуваа", icon: Map },
  { href: "/tours/custom", label: "Захиалгат аялал", description: "4 асуулт — хувийн төлөвлөгөө", icon: Wand2 },
  { href: "/flights", label: "Хямд тийз", description: "Онцлох нислэгийн үнэ", icon: Plane },
  { href: "/transfer", label: "Хүргэх/Тосох", description: "Онгоцны буудлын тээвэр", icon: Car },
]

export const BLOG_ITEM = { href: "/blog", label: "Блог", icon: BookOpen }
