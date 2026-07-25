"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Calendar,
  CalendarDays,
  MessageCircle,
  DollarSign,
  Eye,
  BadgeCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn, initials } from "@/lib/utils"
import type { GuideRow } from "@/lib/supabase/types"

/** Counts sourced from the (studio) layout's server data (see layout.tsx) —
 *  kept generic here so later pages (recommendations/posts/bookings/messages)
 *  can render inside this same layout without the sidebar contract changing. */
export interface StudioCounts {
  recommendations: number
  posts: number
  pendingBookings: number
  hasUnreadMessages: boolean
}

interface StudioSidebarProps {
  guide: GuideRow
  counts: StudioCounts
}

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Тойм only matches the exact root — every other item matches its subtree too. */
  exact?: boolean
  count?: number
  /** saffron-tinted badge instead of the neutral muted one (Захиалга = pending, actionable). */
  urgent?: boolean
  dot?: boolean
}

/**
 * Desktop Studio nav (design doc, Screen 09/10) — `hidden md:flex` fixed-width
 * column. Active state + link hrefs stay plain Next.js (not the i18n
 * `@/i18n/routing` Link/usePathname) because /studio isn't a registered
 * pathname there; this mirrors AdminSidebar's precedent for the same reason.
 */
export function StudioSidebar({ guide, counts }: StudioSidebarProps) {
  const pathname = usePathname()
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"

  const NAV_ITEMS: NavItem[] = [
    { href: "/studio", label: "Тойм", icon: LayoutDashboard, exact: true },
    { href: "/studio/recommendations", label: "Миний зөвлөмж", icon: MapPin, count: counts.recommendations },
    { href: "/studio/posts", label: "Нийтлэл", icon: FileText, count: counts.posts },
    { href: "/studio/bookings", label: "Захиалга", icon: Calendar, count: counts.pendingBookings, urgent: true },
    { href: "/studio/availability", label: "Боломжит өдөр", icon: CalendarDays },
    { href: "/studio/messages", label: "Зурвас", icon: MessageCircle, dot: counts.hasUnreadMessages },
    { href: "/studio/earnings", label: "Орлого", icon: DollarSign },
  ]

  return (
    <aside className="hidden shrink-0 border-r border-border bg-card md:flex md:w-[236px] md:flex-col md:gap-[3px] md:p-3.5">
      {/* mark */}
      <div className="flex items-center gap-2 px-2.5 pb-4 pt-1.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="6" cy="18" r="2.4" fill="#DE8C2E" />
          <circle cx="18" cy="6" r="2.4" fill="#1A4E8A" />
          <path d="M6.5 16 Q13 13 17 7.5" stroke="#1A4E8A" strokeWidth="1.8" strokeDasharray="2.5 2.5" fill="none" />
        </svg>
        <span className="font-display text-[19px] font-extrabold text-foreground">
          Azen <span className="text-[13px] font-bold text-saffron">Studio</span>
        </span>
      </div>

      {/* nav */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? path === item.href : path === item.href || path.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-[11px] px-3 py-2.5 text-[13.5px] font-semibold transition-colors",
                active
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-[17px] shrink-0" strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {typeof item.count === "number" && item.count > 0 && (
                <span
                  className={cn(
                    "rounded-pill px-2 py-0.5 text-[11px] font-bold",
                    item.urgent ? "bg-saffron-50 text-saffron-600" : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.count}
                </span>
              )}
              {item.dot && <span aria-label="Шинэ зурвас" className="size-2 shrink-0 rounded-full bg-saffron" />}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      {guide.slug && (
        <Link
          href={`/guides/${guide.slug}`}
          className="flex items-center gap-2 rounded-[11px] border border-border px-3 py-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Eye className="size-4 shrink-0" />
          Нийтийн профайл
        </Link>
      )}

      <div className="mt-2 flex items-center gap-2.5 border-t border-border px-2.5 pb-1 pt-3">
        {guide.image ? (
          <img src={guide.image} alt={guide.name} className="size-8 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-xs font-bold text-white">
            {initials(guide.name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 truncate text-[12.5px] font-bold text-foreground">
            {guide.name}
            {guide.is_verified && <BadgeCheck className="size-[13px] shrink-0 text-success" />}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">
            Хөтөч{guide.location ? ` · ${guide.location}` : ""}
          </div>
        </div>
      </div>
    </aside>
  )
}
