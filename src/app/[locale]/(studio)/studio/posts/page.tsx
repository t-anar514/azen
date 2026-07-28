import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getCurrentGuide } from "@/lib/guides/current"
import { guideFallbackPath } from "@/lib/studio/context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PostListRow {
  id: string
  slug: string
  title: string
  published: boolean
  published_at: string | null
}

/** `/studio/posts` (Нийтлэл) — the guide's blog posts, published + drafts. */
export default async function StudioPostsPage() {
  const ctx = await getCurrentGuide()
  if (!ctx) redirect(await guideFallbackPath())
  const { guide } = ctx
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from("posts")
    .select("id,slug,title,published,published_at")
    .eq("author_guide_id", guide.id)
    .order("published_at", { ascending: false, nullsFirst: true })
    .returns<PostListRow[]>()
  const posts = rows ?? []

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">Нийтлэл</h1>
          <p className="mt-1 text-sm text-muted-foreground">Таны бичсэн блог нийтлэлүүд.</p>
        </div>
        <Button asChild variant="message" className="rounded-pill">
          <Link href="/studio/new?tab=post">
            <Plus className="size-[15px]" strokeWidth={2.4} /> Шинэ нийтлэл
          </Link>
        </Button>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-card border border-border bg-card px-5 py-16 text-center">
          <p className="text-sm text-muted-foreground">Одоогоор нийтлэл алга.</p>
          <Link href="/studio/new?tab=post" className="mt-2 inline-block text-sm font-semibold text-primary">
            Эхний нийтлэлээ бичих →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
          {posts.map((p) => {
            const inner = (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{p.title}</div>
                  {p.published_at && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(p.published_at).toLocaleDateString("mn-MN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  )}
                </div>
                <Badge variant={p.published ? "confirmed" : "pending"} className="shrink-0">
                  {p.published ? "Нийтэлсэн" : "Ноорог"}
                </Badge>
              </>
            )
            return p.published ? (
              <Link key={p.id} href={`/blog/${p.slug}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40">
                {inner}
              </Link>
            ) : (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                {inner}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
