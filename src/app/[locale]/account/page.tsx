import { redirect } from "next/navigation"
import {
  CalendarDays,
  Car as CarIcon,
  ChevronRight,
  Heart,
  Inbox,
  LayoutDashboard,
  Route as RouteIcon,
  Settings,
  ShieldCheck,
  Ticket,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/auth/SignOutButton"
import { cn } from "@/lib/utils"
import type { ProfileRow } from "@/lib/supabase/types"

const ROLE_LABEL: Record<string, string> = {
  admin: "Админ",
  guide: "Хөтөч",
  driver: "Жолооч",
  user: "Аялагч",
}

/**
 * Redesigned account (design doc, Screen 09 / mobile Screen 13): navy hero,
 * an overlapping 3-stat strip, a continue-trip card, a tappable menu list and
 * the become-guide banner. Mobile-first; centres on wider screens.
 */
export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirectTo=/account")
  }

  const [{ data: profile }, savedRes, tripsRes, bookingsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<ProfileRow>(),
    supabase.from("saved_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("itineraries")
      .select("id, title, items, updated_at")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase.from("bookings").select("id", { count: "exact", head: true }),
  ])

  const name = profile?.full_name?.trim() || user.email?.split("@")[0] || "Аялагч"
  const initial = name[0]?.toUpperCase() ?? "A"
  const role = profile?.role ?? "user"

  const saved = savedRes.count ?? 0
  const trips = (tripsRes.data ?? []) as { id: string; title: string | null; items: unknown }[]
  const tripCount = trips.length
  const bookings = bookingsRes.count ?? 0

  const latestTrip = trips[0] ?? null
  const activityCount = Array.isArray(latestTrip?.items) ? latestTrip!.items.length : 0
  const progress = Math.min(100, Math.max(8, Math.round((activityCount / 12) * 100)))

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden px-5 pb-16 pt-10 text-white"
        style={{
          background:
            "radial-gradient(120% 140% at 80% 0%, #0F3B6B, #123456 55%, #0A1B2E)",
        }}
      >
        <div
          className="pointer-events-none absolute -top-6 right-8 h-40 w-40 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(222,140,46,.35), transparent 62%)" }}
        />
        <div className="relative mx-auto flex max-w-2xl items-center gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={name}
              className="size-16 rounded-full border-[3px] border-white/30 object-cover"
            />
          ) : (
            <div
              className="flex size-16 items-center justify-center rounded-full border-[3px] border-white/30 font-display text-2xl font-extrabold"
              style={{ background: "linear-gradient(135deg,#1A4E8A,#2D7DD2)" }}
            >
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-2xl font-extrabold">{name}</h1>
              <span className="rounded-pill bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white/90">
                {ROLE_LABEL[role] ?? "Аялагч"}
              </span>
            </div>
            <p className="truncate text-sm text-white/70">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5">
        {/* ── Overlapping stat strip ── */}
        <div className="relative z-[1] -mt-10 grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-card text-center shadow-sm">
          <Stat n={saved} label="Хадгалсан" divider />
          <Stat n={tripCount} label="Аялал" divider />
          <Stat n={bookings} label="Захиалга" />
        </div>

        {/* ── Continue trip ── */}
        {latestTrip && (
          <Link
            href={{ pathname: "/planner", query: { trip: latestTrip.id } } as never}
            className="mt-4 block overflow-hidden rounded-2xl p-4 text-white"
            style={{ background: "linear-gradient(105deg,#0F3B6B,#1A4E8A 60%,#2D7DD2)" }}
          >
            <div className="text-[11px] text-white/75">Үргэлжлүүлэх</div>
            <div className="mb-2 mt-0.5 font-display text-base font-extrabold">
              {latestTrip.title || "Миний аялал"}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <span className="block h-full rounded-full bg-saffron" style={{ width: `${progress}%` }} />
            </div>
          </Link>
        )}

        {/* ── Menu list ── */}
        <div className="mt-5 divide-y divide-[#F1F5F9] rounded-2xl border border-border bg-card px-4">
          <MenuRow icon={Heart} label="Хадгалсан газрууд" count={saved} href="/account/saved" />
          <MenuRow icon={RouteIcon} label="Миний аялал" count={tripCount} href="/planner" />
          <MenuRow icon={Ticket} label="Захиалга" count={bookings} href="/transfer/history" />
          {(role === "guide" || role === "admin") && (
            <>
              <MenuRow icon={LayoutDashboard} label="Миний студи" href="/studio" />
              <MenuRow icon={Inbox} label="Ирсэн зурвас" href="/account/messages" />
            </>
          )}
          {/* An approved driver's studio is the schedule, not the /studio root
              (which is guide-only and bounces them straight here again). Without
              these two rows an approved driver has no route into the thing they
              were approved for except by typing the URL. */}
          {role === "driver" && (
            <>
              <MenuRow icon={CalendarDays} label="Миний хуваарь" href="/studio/schedule" />
              <MenuRow icon={CarIcon} label="Ажлууд" href="/studio/jobs" />
            </>
          )}
          {role === "admin" && (
            <MenuRow icon={ShieldCheck} label="Админ самбар" href="/admin" />
          )}
          <MenuRow icon={Settings} label="Тохиргоо" href="/account/saved" />
        </div>

        {/* ── Become a guide ──
            Not shown to a driver: they already work here, and inviting them to
            "start earning" reads as though their approval never landed. */}
        {role !== "guide" && role !== "admin" && role !== "driver" && (
          <div
            className="mt-5 rounded-2xl p-4 text-white"
            style={{ background: "linear-gradient(120deg,#2E8B6F,#1A4E4A)" }}
          >
            <div className="font-display font-extrabold">Хөтөч бол</div>
            <p className="mt-1 mb-3 text-xs text-white/85">
              Газраа санал болго, блог бич, орлого ол.
            </p>
            <Link
              href="/guides/apply"
              className="inline-block rounded-pill bg-white px-4 py-2 text-xs font-bold text-[#1A4E4A]"
            >
              Эхлэх →
            </Link>
          </div>
        )}

        {/* ── Sign out ── */}
        <div className="mt-5">
          <SignOutButton className="w-full rounded-pill" />
        </div>
      </div>
    </div>
  )
}

function Stat({ n, label, divider = false }: { n: number; label: string; divider?: boolean }) {
  return (
    <div className={cn("py-3.5", divider && "border-r border-[#F1F5F9]")}>
      <div className="font-display text-xl font-extrabold text-foreground">{n}</div>
      <div className="text-[10.5px] text-muted-foreground">{label}</div>
    </div>
  )
}

function MenuRow({
  icon: Icon,
  label,
  count,
  href,
}: {
  icon: React.ElementType
  label: string
  count?: number
  href: string
}) {
  return (
    <Link href={href as never} className="flex items-center gap-3.5 py-3.5">
      <Icon className="size-[19px] shrink-0 text-primary" strokeWidth={2} />
      <span className="flex-1 text-sm font-semibold text-foreground">{label}</span>
      {count != null && <span className="text-xs text-muted-foreground">{count}</span>}
      <ChevronRight className="size-4 shrink-0 text-[#CBD5E1]" strokeWidth={2.5} />
    </Link>
  )
}
