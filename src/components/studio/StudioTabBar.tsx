"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MapPin, MessageCircle, Plus, User } from "lucide-react"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface TabItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

const LEFT_TABS: TabItem[] = [
  { href: "/studio", label: "Студи", icon: LayoutDashboard, exact: true },
  { href: "/studio/recommendations", label: "Зөвлөмж", icon: MapPin },
]

const RIGHT_TABS: TabItem[] = [
  { href: "/studio/messages", label: "Зурвас", icon: MessageCircle },
  { href: "/studio/profile", label: "Профайл", icon: User },
]

/**
 * Mobile Studio bottom bar (design doc, Screen 13 — first guide-role phone):
 * Студи / Зөвлөмж / a raised saffron FAB (+) → /studio/new / Зурвас /
 * Профайл. `md:hidden`, fixed bottom. The traveler MobileTabBar hides itself
 * on /studio (Task 4.1), so only one bottom bar is ever visible at a time.
 */
export function StudioTabBar() {
  const pathname = usePathname()
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"

  // /studio/new (Task 4.6) has its own mobile sticky action bar (Ноорог |
  // Нийтлэх) at the same fixed-bottom position — per the design doc's
  // mobile Create screen, that bar replaces this nav entirely rather than
  // stacking with it.
  if (path === "/studio/new") return null

  function isActive(href: string, exact?: boolean) {
    return exact ? path === href : path === href || path.startsWith(`${href}/`)
  }

  function tabClass(active: boolean) {
    return cn(
      "flex flex-1 flex-col items-center gap-1 text-[10px] transition-colors",
      active ? "font-bold text-primary" : "font-semibold text-muted-foreground hover:text-foreground"
    )
  }

  return (
    <nav
      aria-label="Студийн цэс"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md md:hidden"
    >
      {LEFT_TABS.map((tab) => {
        const active = isActive(tab.href, tab.exact)
        return (
          <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={tabClass(active)}>
            <tab.icon className="size-[21px]" strokeWidth={2} />
            {tab.label}
          </Link>
        )
      })}

      <Link
        href="/studio/new"
        aria-label="Шинэ зөвлөмж"
        className="-mt-4 flex size-12 shrink-0 items-center justify-center rounded-full bg-saffron text-white shadow-[0_8px_20px_-6px_rgba(222,140,46,0.7)]"
      >
        <Plus className="size-6" strokeWidth={2.6} />
      </Link>

      {RIGHT_TABS.map((tab) => {
        const active = isActive(tab.href)
        return (
          <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={tabClass(active)}>
            <tab.icon className="size-[21px]" strokeWidth={2} />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
