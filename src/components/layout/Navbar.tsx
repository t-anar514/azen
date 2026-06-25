"use client"

import * as React from "react"
import NextImage from "next/image"
// Workaround for Next.js 16 + React 19 type mismatch
const Image = NextImage as any
import { Link } from "@/i18n/routing"
// Flights/Transfer aren't registered in i18n/routing.ts's `pathnames` map
// (deliberate scope-reduction for this feature), so they use plain
// next/link instead of the typed locale-aware Link used everywhere else.
import NextLink from "next/link"
import { useTranslations } from "next-intl"

import { Search, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { GlobalSearch } from "./GlobalSearch"
import { AccountMenu } from "./AccountMenu"


export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const t = useTranslations("Navigation")


  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="w-full flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-16 md:h-12 md:w-24 overflow-hidden">
             <Image src="/logo.png" alt="Azen Logo" fill className="object-contain" />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
         <Link href="/guides" className="text-sm font-medium hover:text-primary transition-colors">
            {t("guides")}
          </Link> 
          <Link href="/planner" className="text-sm font-medium hover:text-primary transition-colors">
            {t("planner")}
          </Link>
          <Link href="/hacks" className="text-sm font-medium hover:text-primary transition-colors">
            {t("hacks")}
          </Link>
          <Link href="/essentials" className="text-sm font-medium hover:text-primary transition-colors">
            {t("essentials")}
          </Link>
          <Link href="/learn" className="text-sm font-medium hover:text-primary transition-colors">
            {t("learn")}
          </Link>
          <NextLink href="/flights" className="text-sm font-medium hover:text-primary transition-colors">
            {t("flights")}
          </NextLink>
          <NextLink href="/transfer" className="text-sm font-medium hover:text-primary transition-colors">
            {t("transfer")}
          </NextLink>
        </nav>

        {/* Global Search + Account (kept visually apart from the content nav tabs above) */}
        <div className="hidden md:flex items-center gap-4">
          <GlobalSearch locale="mn" />
          <div className="h-6 w-px bg-border" />
          <AccountMenu />
        </div>


        {/* Mobile Search & Menu Toggle */}
        <div className="flex items-center gap-4">
          <GlobalSearch locale="mn" className="md:hidden" />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-11 w-11 hover:bg-muted rounded-full">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] rounded-l-3xl p-6">
              <div className="flex flex-col gap-2 pt-12">
                <Link href="/guides" className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t("guides")}
                </Link>
                <Link href="/planner" className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t("planner")}
                </Link>
                <Link href="/hacks" className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t("hacks")}
                </Link>
                <Link href="/essentials" className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t("essentials")}
                </Link>
                <Link href="/learn" className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t("learn")}
                </Link>
                <NextLink href="/flights" className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t("flights")}
                </NextLink>
                <NextLink href="/transfer" className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t("transfer")}
                </NextLink>
                <div className="my-2 border-t border-border" />
                <AccountMenu variant="mobile" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
