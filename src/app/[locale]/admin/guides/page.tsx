import Link from "next/link"
import { Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { GuidesTable, type PendingApplication } from "@/components/admin/GuidesTable"
import type { GuideRow } from "@/lib/supabase/types"

interface ApplicationRow {
  id: string
  full_name: string
  city_id: string | null
  languages: string[] | null
  created_at: string
}

export default async function AdminGuidesPage() {
  const supabase = await createClient()

  const [{ data: guideRows }, { data: appRows }, { data: cityRows }] = await Promise.all([
    supabase.from("guides").select("*").order("created_at", { ascending: false }),
    supabase
      .from("guide_applications")
      .select("id, full_name, city_id, languages, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .returns<ApplicationRow[]>(),
    supabase.from("cities").select("id, name"),
  ])

  const guides = (guideRows ?? []) as GuideRow[]
  const cityNameById = Object.fromEntries(
    (cityRows ?? []).map((c: { id: string; name: string }) => [c.id, c.name])
  )

  // Applications are the real approve queue (submitted via /guides/apply).
  const applications: PendingApplication[] = (appRows ?? []).map((a) => ({
    id: a.id,
    name: a.full_name,
    location: a.city_id ? (cityNameById[a.city_id] ?? null) : null,
    specialties: (a.languages ?? []).join(", "),
  }))

  const active = guides.filter((g) => g.is_active).length
  const inactive = guides.length - active
  // "Хүлээгдэж буй" = applications awaiting approval + any deactivated guides.
  const pending = applications.length + inactive
  const total = active + pending
  const rated = guides.filter((g) => g.review_count > 0)
  const avgRating =
    rated.length > 0 ? (rated.reduce((sum, g) => sum + g.rating, 0) / rated.length).toFixed(1) : "—"

  const desktopStats = [
    { label: "Нийт хөтөч", value: total, tone: "text-foreground" },
    { label: "Идэвхтэй", value: active, tone: "text-success" },
    { label: "Хүлээгдэж буй", value: pending, tone: "text-saffron-600" },
    { label: "Дундаж үнэлгээ", value: avgRating, tone: "text-primary" },
  ]

  return (
    /* Mobile is a full-bleed dark screen (design "Админ — Admin"); desktop keeps
       the light content area beside the dark sidebar (design Screen 14). */
    <div className="-mx-4 -mt-5 min-h-screen bg-[#0C1826] px-4 pb-10 pt-5 text-white md:mx-0 md:mt-0 md:min-h-0 md:bg-transparent md:p-0 md:text-foreground">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-extrabold tracking-tight text-white md:text-3xl md:text-foreground">
            Хөтчүүд
          </h1>
          <p className="mt-1 text-[13px] text-white/55 md:text-base md:text-muted-foreground">
            <span className="md:hidden">Профайл, төлөв, үнэлгээ</span>
            <span className="hidden md:inline">Хөтчийн профайл, төлөв, үнэлгээг удирдах</span>
          </p>
        </div>

        {/* desktop: full button. mobile: compact icon (the mockup's phone has none,
            but dropping it would make adding a guide impossible on mobile). */}
        <Link
          href="/admin/guides/new"
          aria-label="Шинэ хөтөч"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:hidden"
        >
          <Plus className="size-4" />
        </Link>
        <Link
          href="/admin/guides/new"
          className="hidden shrink-0 items-center gap-2 rounded-well bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-sky-900 md:inline-flex"
        >
          <Plus className="size-4" />
          Шинэ хөтөч
        </Link>
      </div>

      {/* ── Stats: 2 dark tiles on mobile, 4 light tiles on desktop ── */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:hidden">
        <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
          <div className="text-[11.5px] font-medium text-white/55">Нийт хөтөч</div>
          <div className="mt-1 font-display text-[26px] font-extrabold text-white">{total}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
          <div className="text-[11.5px] font-medium text-white/55">Хүлээгдэж буй</div>
          <div className="mt-1 font-display text-[26px] font-extrabold text-saffron">{pending}</div>
        </div>
      </div>

      <div className="mt-6 hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
        {desktopStats.map((stat) => (
          <div key={stat.label} className="rounded-card border border-border bg-card p-5 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
            <div className={`mt-1 font-display text-[28px] font-extrabold ${stat.tone}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 md:mt-6">
        <GuidesTable guides={guides} applications={applications} />
      </div>
    </div>
  )
}
