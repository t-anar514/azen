"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Car,
  CircleDollarSign,
  LayoutDashboard,
  MapPin,
  Newspaper,
  Plane,
  Route,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react"

import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/admin", label: "Хянах самбар", icon: LayoutDashboard },
  { href: "/admin/cities", label: "Хотууд", icon: Building2 },
  { href: "/admin/places", label: "Газрууд", icon: MapPin },
  { href: "/admin/blog", label: "Нийтлэл", icon: Newspaper },
  { href: "/admin/tours", label: "Аялал", icon: Wand2 },
  { href: "/admin/guides", label: "Хөтчүүд", icon: Users },
  { href: "/admin/learn", label: "Хэллэг", icon: Sparkles },
  { href: "/admin/drivers", label: "Жолооч", icon: Car },
  { href: "/admin/transfers", label: "Тээвэр", icon: Route },
  { href: "/admin/transfer-pricing", label: "Тээврийн үнэ", icon: CircleDollarSign },
  { href: "/admin/flights", label: "Нислэг", icon: Plane },
  { href: "/admin/users", label: "Хэрэглэгч", icon: Users },
]

interface AdminSidebarProps {
  userInitial: string
  userName: string
}

export function AdminSidebar({ userInitial, userName }: AdminSidebarProps) {
  const pathname = usePathname()

  // strip the /mn locale prefix for comparison
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"

  return (
    <aside className="md:w-60 shrink-0">
      <div
        className="md:sticky md:top-6 flex flex-col gap-1 rounded-card p-4 text-white"
        style={{ background: "#0C1826" }}
      >
        <div className="px-2 pb-3">
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Azen <span style={{ color: "#8FC0F0" }}>Admin</span>
          </span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin" ? path === "/admin" : path.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/[.06] hover:text-white"
                )}
              >
                <item.icon
                  className={cn("size-4 shrink-0", active ? "text-[#8FC0F0]" : "")}
                />
                {item.label}
              </Link>
            )
          })}
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
      </div>
    </aside>
  )
}
