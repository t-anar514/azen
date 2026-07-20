import { PostCard } from "@/components/blog/PostCard"
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

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <PageHeader
          eyebrow="Сторис локалуудаас"
          title={t("title")}
          lead={t("description")}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              categoryLabel={
                post.category && t.has(`categories.${post.category}`)
                  ? t(`categories.${post.category}`)
                  : post.category ?? undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
