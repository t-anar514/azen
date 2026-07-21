import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

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
    <div className="mx-auto flex max-w-content flex-col gap-8 px-4 py-10 md:flex-row">
      <AdminSidebar userInitial={initial} userName={name} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
