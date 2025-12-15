"use client"

import * as React from "react"
import NextLink from "next/link"
import Image from "next/image"
// Workaround for Next.js 16 + React 19 type mismatch
const Link = NextLink as any

import { Search, Menu, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)

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
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-32 overflow-hidden">
             <Image src="/logo.png" alt="Azen Logo" fill className="object-cover" />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/guides" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            Find a Guide
          </Link>
          <Link href="/planner" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            Plan My Trip
          </Link>
          <Link href="/hacks" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            Japan Hacks
          </Link>
          <Link href="/essentials" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            Essentials
          </Link>
          <Link href="/learn" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            Japanese Essentials
          </Link>
        </nav>

        {/* Omnibar (Search) */}
        <div className="hidden md:flex relative w-64 lg:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Kyoto, Guides, Hacks..."
            className="pl-9 h-9 bg-muted/50 focus:bg-background transition-colors rounded-full"
          />
        </div>

        {/* User Actions & Mobile Menu */}
        <div className="flex items-center gap-2">
           {/* My Azen Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">My Azen</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Azen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Saved Itineraries</DropdownMenuItem>
              <DropdownMenuItem>Bookings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log in</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                  Find a Guide
                </Link>
                <Link href="/planner" className="flex items-center gap-2 text-lg font-medium">
                  Plan My Trip
                </Link>
                <Link href="/hacks" className="flex items-center gap-2 text-lg font-medium">
                  Japan Hacks
                </Link>
                 <Link href="/essentials" className="flex items-center gap-2 text-lg font-medium">
                  Essentials
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
