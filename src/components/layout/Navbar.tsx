"use client"

import * as React from "react"
import NextImage from "next/image"
// Workaround for Next.js 16 + React 19 type mismatch
const Image = NextImage as any
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"

import { Search, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { GlobalSearch } from "./GlobalSearch"
import { useParams } from "next/navigation"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const t = useTranslations("Navigation")
  const { locale } = useParams()

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
      <div className="container flex h-28 items-center justify-evenly">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-28 w-40 overflow-hidden">
             <Image src="/logo.png" alt="Azen Logo" fill className="object-contain" />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {/* <Link href="/guides" className="text-sm font-medium hover:text-primary transition-colors">
            {t("guides")}
          </Link> */}
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
        </nav>

        {/* Global Search Omnibar */}
        <div className="hidden md:flex">
          <GlobalSearch locale={locale as string} />
        </div>

        {/* User Actions & Mobile Menu */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-4">
                <Link href="/guides" className="flex items-center gap-2 text-lg font-medium">
                  {t("guides")}
                </Link>
                <Link href="/planner" className="flex items-center gap-2 text-lg font-medium">
                  {t("planner")}
                </Link>
                <Link href="/hacks" className="flex items-center gap-2 text-lg font-medium">
                  {t("hacks")}
                </Link>
                <Link href="/essentials" className="flex items-center gap-2 text-lg font-medium">
                  {t("essentials")}
                </Link>
                <Link href="/learn" className="flex items-center gap-2 text-lg font-medium">
                  {t("learn")}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
