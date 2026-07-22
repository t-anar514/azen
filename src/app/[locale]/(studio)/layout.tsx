import { requireGuide } from "@/lib/guides/current"
import { createClient } from "@/lib/supabase/server"
import { StudioSidebar, type StudioCounts } from "@/components/studio/StudioSidebar"
import { StudioTabBar } from "@/components/studio/StudioTabBar"

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const { guide } = await requireGuide() // redirects non-guides
  const supabase = await createClient()

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
