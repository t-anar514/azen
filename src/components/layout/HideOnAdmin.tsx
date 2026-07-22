"use client"

import { usePathname } from "next/navigation"

/**
 * Hides the public site chrome (Navbar / Footer) on /admin and /studio routes
 * so each area owns its own layout: /admin gets a dark sidebar on desktop and
 * the AdminMobileNav header + bottom bar on mobile (design doc, Screen 13/14);
 * /studio (the guide Studio) gets its own StudioSidebar + StudioTabBar (design
 * doc, Screen 09/13) — without this the public navbar would render above it.
 */
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"
  if (path === "/admin" || path.startsWith("/admin/")) return null
  if (path === "/studio" || path.startsWith("/studio/")) return null
  return <>{children}</>
}
