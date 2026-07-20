import { Link } from "@/i18n/routing"
import { Clock } from "lucide-react"
import NextImage from "next/image"

import { PillBadge } from "@/components/ui/pill-badge"
import type { PostRow } from "@/lib/supabase/types"

const Image = NextImage as any

interface PostCardProps {
  post: PostRow
  categoryLabel?: string
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Intl.DateTimeFormat("mn-MN", { dateStyle: "medium" }).format(new Date(iso))
}

export function PostCard({ post, categoryLabel }: PostCardProps) {
  const date = formatDate(post.published_at ?? post.created_at)

  return (
    <Link
      href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="relative aspect-[3/2] bg-muted overflow-hidden">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-display font-bold text-primary/20">
            {post.title[0]}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          {categoryLabel ? <PillBadge variant="sky">{categoryLabel}</PillBadge> : <span />}
          {post.read_minutes ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {post.read_minutes} мин
            </span>
          ) : null}
        </div>

        <h3 className="font-display text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
        )}

        <div className="mt-auto border-t border-border pt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{date}</span>
          <span className="font-semibold text-primary">Цааш унших →</span>
        </div>
      </div>
    </Link>
  )
}
