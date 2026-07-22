"use client"

import { Home, Compass, Route, User } from "lucide-react"
import { Link, usePathname } from "@/i18n/routing"
import { cn } from "@/lib/utils"

/**
 * Signature mobile navigation (design doc, Screen 13 — traveler tab bar).
 * Four destinations spanning the two product pillars + account. Fixed to the
 * bottom of the viewport on phones only; a spacer keeps the footer clear of it.
 * Hidden on md+ where the top Navbar takes over.
 */
interface Tab {
  href: string
  label: string
  icon: React.ElementType
  /** route prefixes (locale-stripped) that light this tab up */
  match: (path: string) => boolean
}

const TABS: Tab[] = [
  {
    href: "/",
    label: "Нүүр",
    icon: Home,
    match: (p) => p === "/",
  },
  {
    href: "/essentials",
    label: "Судлах",
    icon: Compass,
    match: (p) =>
      ["/essentials", "/experiences", "/city", "/guides", "/learn", "/blog"].some(
        (r) => p === r || p.startsWith(`${r}/`)
      ),
  },
  {
    href: "/planner",
    label: "Төлөвлөх",
    icon: Route,
    match: (p) =>
      ["/planner", "/tours", "/flights", "/transfer"].some(
        (r) => p === r || p.startsWith(`${r}/`)
      ),
  },
  {
    href: "/account",
    label: "Профайл",
    icon: User,
    match: (p) =>
      ["/account", "/driver", "/login", "/signup"].some(
        (r) => p === r || p.startsWith(`${r}/`)
      ),
  },
]

/**
 * Routes that manage their own chrome — no traveler tab bar there. Planner,
 * transfer and the custom-tour builder each carry their own sticky bottom
 * action bar (cost / total / publish), which the design uses in place of the
 * tab bar; admin, the guide Studio (own StudioTabBar, design doc Screen 09/13)
 * and auth are outside the traveler shell entirely.
 */
const HIDDEN_PREFIXES = [
  "/admin",
  "/studio",
  "/planner",
  "/transfer",
  "/tours/custom",
  "/forgot-password",
  "/reset-password",
  "/auth",
]

export function MobileTabBar() {
  const pathname = usePathname()

  if (HIDDEN_PREFIXES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return null
  }

  return (
    <>
      {/* keeps the footer scrollable clear of the fixed bar */}
      <div aria-hidden className="h-[70px] md:hidden" />

      <nav
        aria-label="Үндсэн цэс"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-[#EBF0F6] bg-card/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden"
      >
        {TABS.map((tab) => {
          const active = tab.match(pathname)
          return (
            <Link
              key={tab.href}
              href={tab.href as never}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 text-[10px] transition-colors",
                active
                  ? "font-bold text-primary"
                  : "font-semibold text-[#94A3B8] hover:text-foreground"
              )}
            >
              <tab.icon className="size-[22px]" strokeWidth={2} />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
