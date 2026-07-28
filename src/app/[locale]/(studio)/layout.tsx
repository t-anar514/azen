import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio/context"
import { StudioSidebar, type StudioCounts } from "@/components/studio/StudioSidebar"
import { StudioTabBar } from "@/components/studio/StudioTabBar"
import {
  DriverStudioSidebar,
  type DriverStudioCounts,
} from "@/components/studio/driver/DriverStudioSidebar"
import { DriverStudioTabBar } from "@/components/studio/driver/DriverStudioTabBar"
import { todayKey } from "@/lib/drivers/scheduleData"
import { fromDateKey } from "@/lib/drivers/shifts"

/**
 * One shell, two professions — see `@/lib/studio/context` for why the driver
 * studio lives here rather than in a parallel route tree.
 */
export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const context = await requireStudio() // redirects anyone who is neither
  const supabase = await createClient()

  if (context.kind === "driver") {
    const { driver } = context

    const { count: jobCount } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("driver_id", driver.id)
      .in("status", ["assigned", "en_route", "arrived"])

    const counts: DriverStudioCounts = {
      upcomingJobs: jobCount ?? 0,
      daysLeft: daysUntil(driver.schedule_open_until),
    }

    return (
      <div className="min-h-screen bg-background md:flex">
        <DriverStudioSidebar driver={driver} counts={counts} />
        <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
        <DriverStudioTabBar />
      </div>
    )
  }

  const { guide } = context

  // Nav badge counts (Тойм excluded — it has none). All four reads are the
  // guide's own rows, RLS-permitted on the plain session client the same way
  // loadGuideStats/loadGuideRecRows already read places/guide_bookings.
  const [{ count: recCount }, { count: postCount }, { count: pendingCount }, { count: unreadCount }] =
    await Promise.all([
      supabase.from("places").select("id", { count: "exact", head: true })
        .eq("created_by_guide_id", guide.id),
      supabase.from("posts").select("id", { count: "exact", head: true })
        .eq("author_guide_id", guide.id),
      supabase.from("guide_bookings").select("id", { count: "exact", head: true })
        .eq("guide_id", guide.id).eq("status", "pending"),
      supabase.from("messages").select("id", { count: "exact", head: true })
        .eq("guide_id", guide.id).eq("status", "new"),
    ])

  const counts: StudioCounts = {
    recommendations: recCount ?? 0,
    posts: postCount ?? 0,
    pendingBookings: pendingCount ?? 0,
    hasUnreadMessages: (unreadCount ?? 0) > 0,
  }

  return (
    <div className="min-h-screen bg-background md:flex">
      <StudioSidebar guide={guide} counts={counts} />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <StudioTabBar />
    </div>
  )
}

/** Whole days from today to `dateKey`; null when nothing has been opened. */
function daysUntil(dateKey: string | null): number | null {
  if (!dateKey) return null
  const ms = fromDateKey(dateKey).getTime() - fromDateKey(todayKey()).getTime()
  return Math.round(ms / 86_400_000)
}
