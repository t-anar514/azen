"use client"

import * as React from "react"
import NextImage from "next/image"
const Image = NextImage as any
import { Link, usePathname } from "@/i18n/routing"
import { ChevronDown, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { GlobalSearch } from "./GlobalSearch"
import { AccountMenu } from "./AccountMenu"
import { BLOG_ITEM, GUIDE_MENU, PLAN_MENU, type NavItem } from "./NavMenus"

/* Restructured IA: the nine flat links collapse into two menus that name the
   product's two pillars, plus Блог. Transfer keeps its own CTA slot. */
const MENUS: { id: string; label: string; kicker: string; items: NavItem[] }[] = [
  { id: "guide", label: "Аялах хөтөч", kicker: "Guide", items: GUIDE_MENU },
  { id: "plan", label: "Төлөвлөх", kicker: "Plan", items: PLAN_MENU },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)
  const pathname = usePathname()
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // close on route change and on Escape
  React.useEffect(() => setOpenMenu(null), [pathname])
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // small grace period so the pointer can cross the gap into the panel
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120)
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled || openMenu
          ? "bg-card/90 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      )}
      onMouseLeave={scheduleClose}
    >
      <div className="w-full flex h-14 items-center justify-between px-4 md:px-8 gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="shrink-0 flex items-center">
          <div className="relative h-8 w-14 md:h-10 md:w-20">
            <Image src="/logo.png" alt="Azen" fill className="object-contain" />
          </div>
        </Link>

        {/* ── Desktop nav: two menus + Блог ── */}
        <nav className="hidden md:flex items-center gap-1">
          {MENUS.map((menu) => (
            <div
              key={menu.id}
              className="relative"
              onMouseEnter={() => {
                cancelClose()
                setOpenMenu(menu.id)
              }}
            >
              <button
                type="button"
                aria-expanded={openMenu === menu.id}
                aria-haspopup="true"
                onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  openMenu === menu.id
                    ? "text-primary bg-secondary"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                )}
              >
                {menu.label}
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    openMenu === menu.id && "rotate-180"
                  )}
                />
              </button>
            </div>
          ))}

          <Link
            href={BLOG_ITEM.href as any}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              pathname === BLOG_ITEM.href
                ? "text-primary bg-secondary"
                : "text-foreground/70 hover:text-foreground hover:bg-muted"
            )}
          >
            {BLOG_ITEM.label}
          </Link>
        </nav>

        {/* ── Right cluster: search | currency | account | CTA ── */}
        <div className="hidden md:flex items-center gap-2">
          <GlobalSearch locale="mn" />
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">₮ MNT</span>
          <div className="h-5 w-px bg-border" />
          <AccountMenu />

          {/* Outlined pill — solid saffron stays reserved for Book/Request/Confirm */}
          <Button asChild variant="outline" size="sm" className="rounded-full px-5 font-semibold">
            <Link href="/transfer">Хүргэх/Тосох</Link>
          </Button>
        </div>

        {/* ── Mobile: search + hamburger ── */}
        <div className="flex items-center gap-1 md:hidden">
          <GlobalSearch locale="mn" className="md:hidden" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Цэс</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] rounded-l-2xl p-6 pt-10 overflow-y-auto">
              <div className="flex flex-col gap-6">
                {MENUS.map((menu) => (
                  <div key={menu.id}>
                    <p className="text-eyebrow mb-2">{menu.label}</p>
                    <div className="flex flex-col gap-0.5">
                      {menu.items.map((item) => (
                        <Link
                          key={`${menu.id}-${item.href}-${item.label}`}
                          href={item.href as any}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
                        >
                          <item.icon className="size-4 shrink-0 text-primary/70" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                <Link
                  href={BLOG_ITEM.href as any}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
                >
                  <BLOG_ITEM.icon className="size-4 shrink-0 text-primary/70" />
                  {BLOG_ITEM.label}
                </Link>

                <Button asChild variant="outline" className="rounded-full h-12 font-semibold">
                  <Link href="/transfer">Хүргэх/Тосох</Link>
                </Button>

                <div className="border-t border-border pt-2">
                  <AccountMenu variant="mobile" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>

      {/* ── Mega menu panel ── */}
      {MENUS.map((menu) =>
        openMenu === menu.id ? (
          <div
            key={`panel-${menu.id}`}
            onMouseEnter={cancelClose}
            className="hidden md:block absolute inset-x-0 top-14 border-b border-border bg-card/95 backdrop-blur-md shadow-lg"
          >
            <div className="mx-auto max-w-content px-8 py-6">
              <p className="text-eyebrow mb-4">
                {menu.label} <span className="ml-1 opacity-60">{menu.kicker}</span>
              </p>
              <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {menu.items.map((item) => (
                  <Link
                    key={`${menu.id}-${item.href}-${item.label}`}
                    href={item.href as any}
                    onClick={() => setOpenMenu(null)}
                    className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-well bg-tint-sky">
                      <item.icon className="size-4 text-primary" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null
      )}
    </header>
  )
}
