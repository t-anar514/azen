"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Car, DollarSign, Route } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface TabItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

/**
 * Four tabs, no FAB.
 *
 * The guide bar centres a raised (+) because a guide's core act is creating a
 * recommendation. A driver creates nothing — they open time — so the slot is
 * spent on a fourth destination instead of a button with nothing behind it.
 */
const TABS: TabItem[] = [
  { href: "/studio/schedule", label: "Хуваарь", icon: CalendarDays },
  { href: "/studio/jobs", label: "Ажлууд", icon: Route },
  { href: "/studio/earnings", label: "Орлого", icon: DollarSign },
  { href: "/studio/vehicle", label: "Машин", icon: Car },
]

export function DriverStudioTabBar() {
  const pathname = usePathname()
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"

  return (
    <nav
      aria-label="Жолоочийн студи"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {TABS.map((tab) => {
        const active = tab.exact
          ? path === tab.href
          : path === tab.href || path.startsWith(`${tab.href}/`)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <tab.icon className="size-[19px]" strokeWidth={2} />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
