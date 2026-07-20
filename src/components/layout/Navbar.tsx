"use client"

import * as React from "react"
import NextImage from "next/image"
const Image = NextImage as any
import { Link, usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { GlobalSearch } from "./GlobalSearch"
import { AccountMenu } from "./AccountMenu"

/* Primary nav — kept to 4 content links. Transfer gets its own CTA slot.
   Essentials / Learn / Flights live in the footer. */
const NAV_LINKS = [
  { href: "/guides",  labelKey: "guides"  },
  { href: "/planner", labelKey: "planner" },
  { href: "/blog",    labelKey: "blog"    },
  { href: "/flights", labelKey: "flights" },
] as const

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const t = useTranslations("Navigation")
  const pathname = usePathname()

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "bg-card/90 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="w-full flex h-14 items-center justify-between px-4 md:px-8 gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="shrink-0 flex items-center">
          <div className="relative h-8 w-14 md:h-10 md:w-20">
            <Image src="/logo.png" alt="Azen" fill className="object-contain" />
          </div>
        </Link>

        {/* ── Desktop nav (center) ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                pathname === href
                  ? "text-primary bg-secondary"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              )}
            >
              {t(labelKey)}
            </Link>
          ))}
        </nav>

        {/* ── Right cluster: search | account | CTA ── */}
        <div className="hidden md:flex items-center gap-2">
          <GlobalSearch locale="mn" />
          <div className="h-5 w-px bg-border" />
          <AccountMenu />

          {/* Nav CTA — outlined pill; solid saffron is reserved for in-page Book/Request/Confirm */}
          <Button asChild variant="outline" size="sm" className="rounded-full px-5 font-semibold">
            <Link href="/transfer">{t("transfer")}</Link>
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
            <SheetContent side="right" className="w-[280px] rounded-l-2xl p-6 pt-10">
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map(({ href, labelKey }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold transition-colors",
                      pathname === href
                        ? "text-primary bg-secondary"
                        : "text-foreground hover:bg-muted hover:text-primary"
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                    {t(labelKey)}
                  </Link>
                ))}

                <div className="my-3 border-t border-border" />

                {/* Nav CTA in mobile sheet — outlined, matching the no-solid-buttons-in-nav policy */}
                <Button asChild variant="outline" className="rounded-full h-12 font-semibold">
                  <Link href="/transfer">{t("transfer")}</Link>
                </Button>

                <div className="my-1 border-t border-border" />
                <AccountMenu variant="mobile" />
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  )
}
