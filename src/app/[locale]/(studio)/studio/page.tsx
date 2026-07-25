import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Eye,
  Heart,
  Calendar,
  CalendarDays,
  ChevronRight,
  Star,
  FileText,
  Plus,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getCurrentGuide } from "@/lib/guides/current"
import { loadGuideStats, loadGuideRecRows } from "@/lib/guides/stats"
import { profileCompleteness } from "@/lib/guides/completeness"
import { KpiTile } from "@/components/studio/KpiTile"
import { RecsTable, TILE_GRADIENTS } from "@/components/studio/RecsTable"
import { RequestCard, formatTripDate } from "@/components/studio/RequestCard"
import { AcceptDeclineButtons } from "@/components/studio/AcceptDeclineButtons"
import { CompletenessCard } from "@/components/studio/CompletenessCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, initials } from "@/lib/utils"
import type { GuideBookingRow } from "@/lib/supabase/types"

export default async function StudioDashboard() {
  const ctx = await getCurrentGuide()
  if (!ctx) redirect("/guides/apply")
  const { guide } = ctx
  const supabase = await createClient()

  const [stats, recRows, { data: requestRows }, { data: cityRows }] = await Promise.all([
    loadGuideStats(supabase, guide.id),
    loadGuideRecRows(supabase, guide.id),
    supabase.from("guide_bookings")
      .select("*").eq("guide_id", guide.id).eq("status", "pending")
      .order("created_at", { ascending: false })
      .returns<GuideBookingRow[]>(),
    supabase.from("cities").select("id,name"),
  ])
  const requests = requestRows ?? []

  // Traveler names: a guide session can't read travelers' profiles rows
  // directly (RLS own-row-only), so resolve display names via the
  // SECURITY DEFINER RPC from migration 0018, batched in parallel.
  const travelerNames = await Promise.all(
    requests.map((r) =>
      supabase
        .rpc("participant_display_name", { p_user_id: r.traveler_id })
        .then(({ data }) => (data as string | null)?.trim() || "Аялагч")
    )
  )

  const cityNameById = Object.fromEntries(
    (cityRows ?? []).map((c: { id: string; name: string }) => [c.id, c.name])
  )

  const publishedRecs = recRows.filter((r) => r.published).length
  const completeness = profileCompleteness(guide, publishedRecs)
  const firstName = guide.name.split(" ")[0]

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      <header className="mb-6 flex items-center justify-between gap-4 md:items-start">
        <div>
          <p className="text-xs font-bold text-saffron md:hidden">Azen Studio</p>
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">Сайн уу, {firstName} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Энэ 7 хоногт таны профайлыг{" "}
            <b className="font-semibold text-foreground">{stats.views.total.toLocaleString("mn-MN")} удаа</b> үзсэн
            байна
            {stats.views.deltaPct !== 0 &&
              ` — өнгөрсөн долоо хоногоос ${Math.abs(stats.views.deltaPct)}% ${
                stats.views.deltaPct > 0 ? "өссөн" : "буурсан"
              }.`}
          </p>
        </div>

        {/* mobile: top-right avatar chip. desktop: action buttons (mobile relies on
            StudioTabBar's saffron FAB instead — the two are mutually exclusive by breakpoint). */}
        <div className="flex shrink-0 items-center gap-2.5">
          {guide.image ? (
            <img
              src={guide.image}
              alt={guide.name}
              className="size-[38px] rounded-full object-cover md:hidden"
            />
          ) : (
            <span className="flex size-[38px] items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-[13px] font-bold text-white md:hidden">
              {initials(guide.name)}
            </span>
          )}
          <div className="hidden gap-2.5 md:flex">
            <Button asChild variant="outline" className="rounded-pill border-primary text-primary hover:bg-secondary">
              <Link href="/studio/new">
                <FileText className="size-[15px]" />
                Нийтлэл бичих
              </Link>
            </Button>
            <Button asChild variant="message" className="rounded-pill">
              <Link href="/studio/new">
                <Plus className="size-[15px]" strokeWidth={2.4} />
                Шинэ зөвлөмж
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ============ desktop (md+) — Screen 09/10 ============ */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 gap-4">
          <KpiTile
            icon={Eye}
            label="Профайл үзэлт"
            value={stats.views.total}
            delta={stats.views.deltaPct}
            iconClassName="text-sky-500"
          />
          <KpiTile
            icon={Heart}
            label="Хадгалсан"
            value={stats.saves.total}
            delta={stats.saves.deltaPct}
            iconClassName="text-destructive"
          />
          <KpiTile
            icon={Calendar}
            label="Захиалга"
            value={stats.bookings.total}
            sub={`${stats.bookings.pending} хүлээгдэж буй`}
            iconClassName="text-saffron-600"
          />
          <KpiTile
            icon={Star}
            label="Үнэлгээ"
            value={stats.rating.value.toFixed(1)}
            sub={`${stats.rating.count} сэтгэгдэл`}
            iconClassName="fill-saffron text-saffron"
          />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <RecsTable rows={recRows} cityNameById={cityNameById} />

          <div className="space-y-5">
            <section className="rounded-card border border-border bg-card p-5">
              <div className="mb-3.5 flex items-center justify-between">
                <h2 className="font-display text-base font-bold">Ирсэн хүсэлт</h2>
                {requests.length > 0 && <Badge variant="rating">{requests.length} шинэ</Badge>}
              </div>
              {requests.length === 0 ? (
                <p className="text-sm text-muted-foreground">Одоогоор хүсэлт алга.</p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {requests.map((r, i) => (
                    <RequestCard key={r.id} booking={r} travelerName={travelerNames[i]} />
                  ))}
                </div>
              )}
            </section>
            <CompletenessCard pct={completeness.pct} items={completeness.items} />
          </div>
        </div>
      </div>

      {/* ============ mobile (<md) — Screen 13, first guide-role phone ============ */}
      <div className="flex flex-col gap-4 md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <KpiTile
            icon={Eye}
            label="Профайл үзэлт"
            value={stats.views.total}
            delta={stats.views.deltaPct}
            iconClassName="text-sky-500"
          />
          <KpiTile
            icon={Calendar}
            label="Захиалга"
            value={stats.bookings.total}
            sub={`${stats.bookings.pending} хүлээгдэж буй`}
            iconClassName="text-saffron-600"
          />
        </div>

        {/* The mobile tab bar is a fixed 2 + FAB + 2 layout from the design, so
            availability has no tab. Without this row the page would be
            unreachable on a phone — the sidebar carrying it is md:block. */}
        <Link
          href="/studio/availability"
          className="flex items-center gap-3 rounded-thumb border border-border bg-card px-3.5 py-3"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tint-sky">
            <CalendarDays className="size-4 text-sky-600" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">Боломжит өдөр</span>
            <span className="block text-xs text-muted-foreground">
              Ажиллах боломжгүй өдрөө хаах
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>

        {requests.length > 0 && (
          <div className="rounded-thumb border border-[#F1DEBE] bg-saffron-50 p-3.5">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="font-display text-sm font-bold text-foreground">Шинэ хүсэлт</span>
              {/* solid saffron + white — distinct from the desktop panel's light-tint "N шинэ" pill */}
              <span className="rounded-pill bg-saffron px-2 py-0.5 text-[10px] font-bold text-white">
                {requests.length}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-xs font-bold text-white">
                {initials(travelerNames[0])}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] text-foreground">
                  <b>{travelerNames[0]}</b>
                  {requests[0].city ? ` · ${requests[0].city}` : ""}
                </div>
                <div className="text-[11px] font-medium text-saffron-600">
                  {formatTripDate(requests[0].trip_date)} · {requests[0].hours} цаг · ¥
                  {requests[0].amount.toLocaleString("mn-MN")}
                </div>
              </div>
            </div>
            <div className="mt-2.5">
              <AcceptDeclineButtons id={requests[0].id} fullWidth />
            </div>
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-extrabold">Миний зөвлөмж</h2>
            <Link href="/studio/recommendations" className="text-xs font-semibold text-primary">
              Бүгд
            </Link>
          </div>
          {recRows.length === 0 ? (
            <div className="flex flex-col items-start gap-2 rounded-thumb border border-border bg-card p-4 text-sm text-muted-foreground">
              <p>Одоогоор зөвлөмж алга.</p>
              <Link href="/studio/new" className="font-semibold text-primary">
                Эхний зөвлөмжөө нэмэх →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recRows.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2.5 rounded-thumb border border-border bg-card p-2.5"
                >
                  <span
                    className={cn(
                      "size-[42px] shrink-0 rounded-thumb bg-gradient-to-br",
                      TILE_GRADIENTS[i % TILE_GRADIENTS.length]
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-[13.5px] font-bold">{r.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.published ? `${r.views.toLocaleString("mn-MN")} үзэлт · ${r.saves} ♥` : "Ноорог"}
                    </div>
                  </div>
                  <Badge variant={r.published ? "confirmed" : "pending"} className="shrink-0">
                    {r.published ? "Идэвхтэй" : "Ноорог"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
