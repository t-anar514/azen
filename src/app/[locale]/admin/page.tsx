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
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          Хянах самбар
        </h1>
        <p className="text-muted-foreground">Azen дээр яг одоо юу нийтлэгдсэнийг нэг дороос.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex flex-col gap-3 rounded-card border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-well bg-tint-sky text-primary">
                <stat.icon className="size-4" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-foreground">{stat.value}</div>
              <div className="text-sm font-semibold text-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
