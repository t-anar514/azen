import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getCounts() {
  const supabase = await createClient()

  const [cities, posts, guides, learn] = await Promise.all([
    supabase.from("cities").select("id, published", { count: "exact" }),
    supabase.from("posts").select("id, published", { count: "exact" }),
    supabase.from("guides").select("id, is_active", { count: "exact" }),
    supabase.from("phrase_collections").select("id, published", { count: "exact" }),
  ])

  const summarize = (rows: { published?: boolean; is_active?: boolean }[] | null) => {
    const total = rows?.length ?? 0
    const live = rows?.filter((r) => r.published ?? r.is_active).length ?? 0
    return { total, live, draft: total - live }
  }

  return {
    cities: summarize(cities.data),
    posts: summarize(posts.data),
    guides: summarize(guides.data),
    learn: summarize(learn.data),
  }
}

export default async function AdminDashboardPage() {
  const counts = await getCounts()

  const cards = [
    { title: "Essentials (Cities)", href: "/admin/cities", ...counts.cities },
    { title: "Blog", href: "/admin/blog", ...counts.posts },
    { title: "Guides", href: "/admin/guides", ...counts.guides },
    { title: "Learn collections", href: "/admin/learn", ...counts.learn },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase italic tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of everything that's live on Azen right now.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.total}</p>
                <p className="text-xs text-muted-foreground">
                  {card.live} live · {card.draft} draft/inactive
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
