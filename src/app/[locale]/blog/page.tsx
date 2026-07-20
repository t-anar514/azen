import { BlogIndex } from "@/components/blog/BlogIndex"
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
  const posts = await getPosts()

  const categoryLabels: Record<string, string> = {}
  for (const post of posts) {
    if (post.category && !(post.category in categoryLabels)) {
      categoryLabels[post.category] = t.has(`categories.${post.category}`)
        ? t(`categories.${post.category}`)
        : post.category
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <PageHeader
          eyebrow="Сторис локалуудаас"
          title={t("title")}
          lead={t("description")}
        />

        <BlogIndex posts={posts} categoryLabels={categoryLabels} />
      </div>
    </div>
  )
}
