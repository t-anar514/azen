import Link from "next/link"
import { ArrowRight, Building2, MapPin, Newspaper, Sparkles, Star, Users } from "lucide-react"

import { createClient } from "@/lib/supabase/server"

async function getCounts() {
  const supabase = await createClient()

  const [cities, posts, places, guides, learn] = await Promise.all([
    supabase.from("cities").select("id, published"),
    supabase.from("posts").select("id, published"),
    supabase.from("places").select("id, published"),
    supabase.from("guides").select("id, is_active, rating"),
    supabase.from("phrase_collections").select("id, published"),
  ])

  const summarize = (rows: { published?: boolean; is_active?: boolean }[] | null) => {
    const total = rows?.length ?? 0
    const live = rows?.filter((r) => r.published ?? r.is_active).length ?? 0
    return { total, live, draft: total - live }
  }

  const guideRows = guides.data ?? []
  const avgRating =
    guideRows.length > 0
      ? (guideRows.reduce((s, g) => s + (g.rating ?? 0), 0) / guideRows.length).toFixed(1)
      : "—"

  return {
    cities: summarize(cities.data),
    posts: summarize(posts.data),
    places: summarize(places.data),
    guides: summarize(guides.data),
    learn: summarize(learn.data),
    avgRating,
  }
}

export default async function AdminDashboardPage() {
  const counts = await getCounts()

  const stats = [
    { label: "Хотууд", value: counts.cities.total, sub: `${counts.cities.live} нийтэлсэн`, icon: Building2, href: "/admin/cities" },
    { label: "Газрууд", value: counts.places.total, sub: `${counts.places.live} нийтэлсэн`, icon: MapPin, href: "/admin/places" },
    { label: "Хөтчүүд", value: counts.guides.total, sub: `${counts.guides.live} идэвхтэй`, icon: Users, href: "/admin/guides" },
    { label: "Нийтлэл", value: counts.posts.total, sub: `${counts.posts.live} нийтэлсэн`, icon: Newspaper, href: "/admin/blog" },
    { label: "Хэллэгийн багц", value: counts.learn.total, sub: `${counts.learn.live} нийтэлсэн`, icon: Sparkles, href: "/admin/learn" },
    { label: "Дундаж үнэлгээ", value: counts.avgRating, sub: "хөтчүүдийн", icon: Star, href: "/admin/guides" },
  ]

  return (
    /* Mobile is the dark admin screen (design Screen 13) with a compact
       2-up stat grid — one card per row made six numbers a six-screen scroll.
       Desktop keeps the light content area beside the dark sidebar. */
    <div className="-mx-4 -mb-24 -mt-5 min-h-screen bg-[#0C1826] px-4 pb-28 pt-5 text-white md:m-0 md:min-h-0 md:bg-transparent md:p-0 md:text-foreground">
      <div>
        <h1 className="font-display text-[22px] font-extrabold tracking-tight text-white md:text-3xl md:text-foreground">
          Хянах самбар
        </h1>
        <p className="mt-1 text-[13px] text-white/55 md:text-base md:text-muted-foreground">
          Azen дээр яг одоо юу нийтлэгдсэнийг нэг дороос.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:mt-8 md:gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[.04] p-3.5 transition-colors hover:bg-white/[.08] md:gap-3 md:rounded-card md:border-border md:bg-card md:p-5 md:shadow-sm md:transition-all md:hover:-translate-y-0.5 md:hover:bg-card md:hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-8 items-center justify-center rounded-well bg-white/10 text-[#8FC0F0] md:size-9 md:bg-tint-sky md:text-primary">
                <stat.icon className="size-4" />
              </span>
              <ArrowRight className="hidden size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:block" />
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold leading-tight text-white md:text-3xl md:text-foreground">
                {stat.value}
              </div>
              <div className="text-[12.5px] font-semibold leading-snug text-white md:text-sm md:text-foreground">
                {stat.label}
              </div>
              <div className="text-[11px] leading-snug text-white/50 md:text-xs md:text-muted-foreground">
                {stat.sub}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
