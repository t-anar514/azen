"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Menu, Newspaper, User, Users } from "lucide-react"

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "./AdminSidebar"

/** Quick-access destinations for the bottom bar (design doc, Screen 13 — admin). */
const TABS = [
  { href: "/admin", label: "Самбар", icon: LayoutGrid },
  { href: "/admin/guides", label: "Хөтөч", icon: Users },
  { href: "/admin/blog", label: "Нийтлэл", icon: Newspaper },
  { href: "/admin/users", label: "Хэрэглэгч", icon: User },
]

interface AdminMobileNavProps {
  userInitial: string
  userName: string
}

/**
 * Mobile admin chrome (design doc, Screen 13): a dark top bar with the Azen
 * Admin mark + a full-nav drawer, and a dark bottom tab bar for the four main
 * sections. Shown only on phones; the sidebar takes over on md+.
 */
export function AdminMobileNav({ userInitial, userName }: AdminMobileNavProps) {
  const pathname = usePathname()
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"
  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href))

  return (
    <>
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-[#0C1826] px-5 py-3 text-white md:hidden">
        <span className="font-display text-lg font-extrabold tracking-tight">
          Azen <span className="text-xs font-semibold text-[#8FC0F0]">Admin</span>
        </span>
        <div className="flex items-center gap-3">
          <span
            className="flex size-9 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#1A4E8A,#2D7DD2)" }}
          >
            {userInitial}
          </span>
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Админ цэс"
                className="flex size-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-none bg-[#0C1826] p-4 text-white">
              <SheetTitle className="px-2 pb-3 font-display text-lg font-extrabold tracking-tight text-white">
                Azen <span className="text-[#8FC0F0]">Admin</span>
              </SheetTitle>
              <nav className="flex flex-col gap-0.5">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/[.06] hover:text-white"
                    )}
                  >
                    <item.icon className={cn("size-4 shrink-0", isActive(item.href) && "text-[#8FC0F0]")} />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-3 flex items-center gap-3 border-t border-white/10 px-2 pt-4">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: "#DE8C2E" }}
                >
                  {userInitial}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{userName}</div>
                  <div className="text-xs text-white/50">Админ</div>
                </div>
              </div>
              <Link
                href="/"
                className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[.06] hover:text-white"
              >
                <Home className="size-4 shrink-0" />
                Сайт руу буцах
              </Link>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── Bottom tab bar ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-white/10 bg-[#0A1420] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2.5 text-white md:hidden">
        {TABS.map((tab) => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 text-[10px] font-semibold transition-colors",
                active ? "text-[#8FC0F0]" : "text-white/45"
              )}
            >
              <tab.icon className="size-[21px]" strokeWidth={2} />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
