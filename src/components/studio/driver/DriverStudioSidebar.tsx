"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Car, DollarSign, Route } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn, initials } from "@/lib/utils"
import type { DriverRow } from "@/lib/supabase/types"

export interface DriverStudioCounts {
  upcomingJobs: number
  /** Days until the driver's opened schedule runs out; null = never opened. */
  daysLeft: number | null
}

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
  count?: number
}

/**
 * Same shell as the guide's StudioSidebar, different job.
 *
 * The footer card is the one addition. A driver's schedule is a wasting asset —
 * it runs out — and the failure mode this whole feature exists to prevent is a
 * driver who thinks they are bookable while their last opened day quietly
 * passes. Putting the countdown in the chrome means they cannot be on any page
 * of the studio without seeing it.
 */
export function DriverStudioSidebar({
  driver,
  counts,
}: {
  driver: DriverRow
  counts: DriverStudioCounts
}) {
  const pathname = usePathname()
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"

  // Two omissions, both deliberate:
  //
  // Тойм, because for a driver the schedule *is* the overview — greeting, week
  // totals, earnings and upcoming jobs all live on it — and a separate landing
  // page would just be the same panels with the useful half removed.
  //
  // Зурвас, because `messages` is parented on guide_id (0003), so a driver has
  // no inbox to open. A nav item that lands on a guide's empty page is worse
  // than one that isn't there.
  const NAV_ITEMS: NavItem[] = [
    { href: "/studio/schedule", label: "Хуваарь", icon: CalendarDays },
    { href: "/studio/jobs", label: "Ажлууд", icon: Route, count: counts.upcomingJobs },
    { href: "/studio/vehicle", label: "Миний машин", icon: Car },
    { href: "/studio/earnings", label: "Орлого", icon: DollarSign },
  ]

  const urgent = counts.daysLeft !== null && counts.daysLeft <= 7

  return (
    <aside className="hidden shrink-0 border-r border-border bg-card md:flex md:w-[236px] md:flex-col md:gap-[3px] md:p-3.5">
      <div className="flex items-center gap-2 px-2.5 pb-4 pt-1.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="6" cy="18" r="2.4" fill="#DE8C2E" />
          <circle cx="18" cy="6" r="2.4" fill="#1A4E8A" />
          <path d="M6.5 16 Q13 13 17 7.5" stroke="#1A4E8A" strokeWidth="1.8" strokeDasharray="2.5 2.5" fill="none" />
        </svg>
        <span className="font-display text-[19px] font-extrabold text-foreground">
          Azen <span className="text-[13px] font-bold text-saffron">Studio</span>
        </span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? path === item.href
            : path === item.href || path.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-[11px] px-3 py-2.5 text-[13.5px] font-semibold transition-colors",
                active
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-[17px] shrink-0" strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {typeof item.count === "number" && item.count > 0 && (
                <span className="rounded-pill bg-saffron-50 px-2 py-0.5 text-[11px] font-bold text-saffron-600">
                  {item.count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      <Link
        href="/studio/schedule"
        className={cn(
          "rounded-[14px] border p-3 transition-colors",
          urgent
            ? "border-saffron/40 bg-saffron-50 hover:bg-saffron-50/70"
            : "border-border bg-muted/50 hover:bg-muted"
        )}
      >
        <div className="text-eyebrow text-[10px]">Хуваарь дуусах хүртэл</div>
        <div
          className={cn(
            "mt-1 font-display text-[22px] font-extrabold leading-none",
            urgent ? "text-saffron-600" : "text-foreground"
          )}
        >
          {counts.daysLeft === null
            ? "Нээгээгүй"
            : counts.daysLeft <= 0
              ? "Дууссан"
              : `${counts.daysLeft} хоног`}
        </div>
      </Link>

      <div className="mt-2 flex items-center gap-2.5 border-t border-border px-2.5 pb-1 pt-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-xs font-bold text-white">
          {initials(driver.full_name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-bold text-foreground">
            {driver.full_name}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">
            Жолооч · {driver.vehicle_make} {driver.vehicle_model}
          </div>
        </div>
      </div>
    </aside>
  )
}
