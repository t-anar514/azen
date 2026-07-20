import { Eyebrow } from "@/components/ui/eyebrow"
import { Section } from "@/components/ui/section"
import { ArrowLink } from "@/components/ui/arrow-link"
import { PostCard } from "@/components/blog/PostCard"
import type { PostRow } from "@/lib/supabase/types"

export function FromTheBlog({ posts }: { posts: PostRow[] }) {
  if (posts.length === 0) return null

  return (
    <Section tint="muted">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <Eyebrow>Сторис локалуудаас</Eyebrow>
          <h2 className="mt-2 text-section text-foreground">Явахаасаа өмнө уншаарай</h2>
        </div>
        <ArrowLink href="/blog">Бүх нийтлэл</ArrowLink>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <PostCard key={post.id} post={post} categoryLabel={post.category ?? undefined} />
        ))}
      </div>
    </Section>
  )
}
