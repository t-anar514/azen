import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminMobileNav } from "@/components/admin/AdminMobileNav"

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
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  const name = profile?.full_name || user.email?.split("@")[0] || "Админ"
  const initial = name.charAt(0).toUpperCase()

  return (
    <>
      <AdminMobileNav userInitial={initial} userName={name} />
      <div className="flex min-h-screen flex-col md:flex-row">
        <AdminSidebar userInitial={initial} userName={name} />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 md:px-8 md:py-10">
          <div className="mx-auto max-w-content">{children}</div>
        </main>
      </div>
    </>
  )
}
