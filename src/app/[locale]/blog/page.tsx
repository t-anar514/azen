import { BlogIndex, type PostAuthor } from "@/components/blog/BlogIndex"
import { PageHeader } from "@/components/ui/page-header"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import type { PostRow } from "@/lib/supabase/types"

async function getPosts(): Promise<PostRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .order("order_index", { ascending: true })
  return data ?? []
}

export default async function BlogPage() {
  const t = await getTranslations("Hacks")
  const supabase = await createClient()
  const posts = await getPosts()

  const categoryLabels: Record<string, string> = {}
  for (const post of posts) {
    if (post.category && !(post.category in categoryLabels)) {
      categoryLabels[post.category] = t.has(`categories.${post.category}`)
        ? t(`categories.${post.category}`)
        : post.category
    }
  }

  // Author line on the featured card (design doc, mobile blog): resolve the
  // post's guide author to a name + avatar.
  const authorIds = [...new Set(posts.map((p) => p.author_guide_id).filter(Boolean))] as string[]
  const { data: authorGuides } = authorIds.length
    ? await supabase.from("guides").select("id, name, image").in("id", authorIds)
    : { data: [] as { id: string; name: string; image: string | null }[] }
  const guideById = new Map((authorGuides ?? []).map((g) => [g.id, g]))
  const authors: Record<string, PostAuthor> = {}
  for (const post of posts) {
    const g = post.author_guide_id ? guideById.get(post.author_guide_id) : null
    if (g) authors[post.id] = { name: g.name, image: g.image }
  }

  return (
    <div className="min-h-screen bg-background pb-12 md:px-6 md:py-12">
      {/* Mobile heading (design doc, Screen 13) */}
      <div className="px-5 pt-4 md:hidden">
        <h1 className="font-display text-2xl font-extrabold text-foreground">Блог</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Зөвлөгөө, түүх, хөтөчийн бичвэр</p>
      </div>

      <div className="mx-auto max-w-7xl md:space-y-10">
        <div className="hidden md:block">
          <PageHeader eyebrow="Сторис локалуудаас" title={t("title")} lead={t("description")} />
        </div>

        <BlogIndex posts={posts} categoryLabels={categoryLabels} authors={authors} />
      </div>
    </div>
  )
}
