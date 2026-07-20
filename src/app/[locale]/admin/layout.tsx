import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cities", label: "Essentials (Cities)" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/places", label: "Places" },
  { href: "/admin/tours", label: "Tours" },
  { href: "/admin/guides", label: "Guides" },
  { href: "/admin/learn", label: "Learn (Phrasebook)" },
  { href: "/admin/drivers", label: "Drivers" },
  { href: "/admin/transfers", label: "Transfers" },
  { href: "/admin/transfer-pricing", label: "Transfer pricing" },
  { href: "/admin/flights", label: "Flights" },
  { href: "/admin/users", label: "Users" },
]

// Defense-in-depth: middleware.ts already redirects non-admins away from
// /admin/*, but this layout re-checks directly against the database in case
// middleware is ever bypassed, cached, or misconfigured.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirectTo=/admin")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row">
      <aside className="md:w-56 shrink-0">
        <h2 className="mb-4 text-lg font-black uppercase italic tracking-tight">Admin</h2>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary/10 hover:text-foreground transition-colors"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
