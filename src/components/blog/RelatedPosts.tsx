import { Link } from "@/i18n/routing"
import { postGradient } from "@/lib/blog/gradient"
import { RELATED_ID, RELATED_LABEL } from "@/lib/blog/article"
import type { PostRow } from "@/lib/supabase/types"

const CATEGORY_TONES = [
  "text-saffron-600",
  "text-lilac-600",
  "text-sky-700",
  "text-success",
]

function categoryTone(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return CATEGORY_TONES[h % CATEGORY_TONES.length]
}

interface RelatedPostsProps {
  posts: PostRow[]
  categoryLabels?: Record<string, string>
}

export function RelatedPosts({ posts, categoryLabels = {} }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section id={RELATED_ID} className="scroll-mt-28 space-y-4">
      <h2 className="font-display text-[21px] font-extrabold tracking-tight text-foreground">
        {RELATED_LABEL}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}
            className="group overflow-hidden rounded-thumb border border-border bg-card transition-colors hover:border-sky-200"
          >
            <div
              className="aspect-[16/9] w-full bg-cover bg-center"
              style={
                post.cover_image
                  ? { backgroundImage: `url(${post.cover_image})` }
                  : { background: postGradient(post.slug) }
              }
              aria-hidden
            />
            <div className="space-y-1 p-3.5">
              {post.category && (
                <p
                  className={`text-[10.5px] font-bold uppercase tracking-[0.1em] ${categoryTone(post.category)}`}
                >
                  {categoryLabels[post.category] ?? post.category}
                </p>
              )}
              <h3 className="text-[14px] font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                {post.title}
              </h3>
              {post.read_minutes != null && (
                <p className="text-[11.5px] text-muted-foreground">
                  {post.read_minutes} мин уншина
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
