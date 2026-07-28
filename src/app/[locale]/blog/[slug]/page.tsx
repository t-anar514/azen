import { notFound } from "next/navigation"
import { ChevronLeft, ImageIcon, Zap } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/server"
import { ArticleAside, type AsideCity } from "@/components/blog/ArticleAside"
import { ArticleBody } from "@/components/blog/ArticleBody"
import { ArticleCallout, QuickAnswer } from "@/components/blog/ArticleCallout"
import { ArticleMobileHeader } from "@/components/blog/ArticleMobileHeader"
import { ArticleShareButton } from "@/components/blog/ArticleShareButton"
import {
  AskAuthorBar,
  AskAuthorCard,
  AuthorAvatar,
  type ArticleAuthor,
} from "@/components/blog/AskAuthorCard"
import { RelatedPosts } from "@/components/blog/RelatedPosts"
import { SaveHeart } from "@/components/saves/SaveHeart"
import { TrackView } from "@/components/analytics/TrackView"
import { postGradient } from "@/lib/blog/gradient"
import {
  buildArticle,
  GUIDE_TIP_ID,
  GUIDE_TIP_LABEL,
  QUICK_ANSWER_ID,
} from "@/lib/blog/article"
import { formatMnMonthDay } from "@/lib/planner/format"
import type { PostRow } from "@/lib/supabase/types"

interface Props {
  params: Promise<{ slug: string }>
}

const ARTICLE_ID = "article-body"

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single<PostRow>()

  if (!post) notFound()

  const relatedIds = post.related_ids ?? []
  const [{ data: relatedPosts }, { data: authorGuide }] = await Promise.all([
    relatedIds.length
      ? supabase.from("posts").select("*").in("id", relatedIds).eq("published", true)
      : Promise.resolve({ data: [] as PostRow[] }),
    post.author_guide_id
      ? supabase
          .from("guides")
          .select("id, name, location, image, slug, is_verified")
          .eq("id", post.author_guide_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const related = (relatedPosts ?? []) as PostRow[]
  const author: ArticleAuthor | null = authorGuide
    ? {
        id: authorGuide.id,
        name: authorGuide.name,
        location: authorGuide.location,
        image: authorGuide.image,
        slug: authorGuide.slug,
        isVerified: authorGuide.is_verified,
      }
    : null

  // "Энэ хотод" rail — only rendered when the post is attached to a city.
  let city: AsideCity | null = null
  if (post.city_id) {
    const { data: cityRow } = await supabase
      .from("cities")
      .select("slug, name")
      .eq("id", post.city_id)
      .maybeSingle()

    if (cityRow?.slug) {
      const [{ count: placeCount }, { count: guideCount }] = await Promise.all([
        supabase
          .from("places")
          .select("id", { count: "exact", head: true })
          .eq("city_id", post.city_id),
        supabase
          .from("guides")
          .select("id", { count: "exact", head: true })
          .eq("location", cityRow.name)
          .eq("is_active", true),
      ])
      city = {
        slug: cityRow.slug,
        name: cityRow.name,
        placeCount: placeCount ?? 0,
        guideCount: guideCount ?? 0,
      }
    }
  }

  const { blocks, toc } = buildArticle(post, related.length)

  const t = await getTranslations("Hacks")
  const categoryLabels: Record<string, string> = {}
  for (const p of [post, ...related]) {
    if (p.category && !(p.category in categoryLabels)) {
      categoryLabels[p.category] = t.has(`categories.${p.category}`)
        ? t(`categories.${p.category}`)
        : p.category
    }
  }

  const isHack = post.type === "hack"
  const byline = [
    author?.location ? `${author.location} хөтөч` : null,
    post.published_at ? formatMnMonthDay(post.published_at) : null,
    post.read_minutes != null ? `${post.read_minutes} мин уншина` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="min-h-screen bg-background">
      <TrackView event="post_read" props={{ slug: post.slug, type: post.type }} />

      <div className="mx-auto max-w-6xl px-4 pb-12 md:px-6 md:pb-16">
        <ArticleMobileHeader title={post.title} postId={post.id} targetId={ARTICLE_ID} />

        <Link
          href="/blog"
          className="mt-6 hidden items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary md:inline-flex"
        >
          <ChevronLeft className="h-4 w-4" />
          Блог руу буцах
        </Link>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_248px] lg:items-start lg:gap-12">
          <article id={ARTICLE_ID} className="flex min-w-0 flex-col pt-4 md:pt-6">
            {/* Phones lead with the image; desktop leads with the headline. */}
            <header className="order-2 space-y-4 md:order-1">
              <div className="flex flex-wrap items-center gap-2">
                {isHack && (
                  <span className="inline-flex items-center gap-1 rounded-pill bg-tint-saffron px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-saffron-600">
                    <Zap className="h-3 w-3" />
                    Хак
                  </span>
                )}
                {post.category && (
                  <span className="text-[12px] text-muted-foreground">
                    {categoryLabels[post.category] ?? post.category}
                  </span>
                )}
                {post.read_minutes != null && (
                  <span className="text-[12px] text-muted-foreground md:hidden">
                    · {post.read_minutes} мин уншина
                  </span>
                )}
              </div>

              <h1 className="font-display text-[26px] font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-[34px] lg:text-[40px]">
                {post.title}
              </h1>

              <div className="flex items-center gap-3">
                {author ? (
                  <>
                    <AuthorAvatar author={author} className="h-9 w-9 text-[10px]" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 text-[13.5px] font-semibold text-foreground">
                        {author.slug ? (
                          <Link
                            href={{ pathname: "/guides/[slug]", params: { slug: author.slug } }}
                            className="transition-colors hover:text-primary"
                          >
                            {author.name}
                          </Link>
                        ) : (
                          author.name
                        )}
                        {author.isVerified && (
                          <span
                            aria-label="Баталгаажсан хөтөч"
                            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white"
                          >
                            ✓
                          </span>
                        )}
                      </p>
                      {byline && (
                        <p className="truncate text-[11.5px] text-muted-foreground">{byline}</p>
                      )}
                    </div>
                  </>
                ) : (
                  byline && <p className="flex-1 text-[12px] text-muted-foreground">{byline}</p>
                )}

                <div className="hidden items-center gap-1.5 md:flex">
                  <SaveHeart
                    itemType="post"
                    itemId={post.id}
                    icon="bookmark"
                    withSheet
                    className="bg-transparent shadow-none hover:bg-muted"
                  />
                  <ArticleShareButton
                    title={post.title}
                    className="bg-transparent shadow-none hover:bg-muted"
                  />
                </div>
              </div>
            </header>

            <div className="order-1 -mx-4 mb-5 md:order-2 md:mx-0 md:mb-0 md:mt-6">
              {post.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover_image}
                  alt=""
                  className="aspect-[16/9] w-full object-cover md:rounded-card"
                />
              ) : (
                <div
                  className="flex aspect-[16/9] w-full items-center justify-center md:rounded-card"
                  style={{ background: postGradient(post.slug) }}
                  aria-hidden
                >
                  <ImageIcon className="h-7 w-7 text-white/50" />
                </div>
              )}
            </div>

            <div className="order-3 space-y-5 pt-6">
              {post.excerpt?.trim() && (
                <QuickAnswer id={QUICK_ANSWER_ID} text={post.excerpt} />
              )}

              {post.tags.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-pill bg-muted px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}

              <ArticleBody blocks={blocks} />

              {post.pro_tip?.trim() && (
                <ArticleCallout
                  id={GUIDE_TIP_ID}
                  tone="tip"
                  title={GUIDE_TIP_LABEL}
                  text={post.pro_tip}
                  className="my-6"
                />
              )}

              {author && <AskAuthorCard author={author} />}

              <div className="pt-4">
                <RelatedPosts posts={related} categoryLabels={categoryLabels} />
              </div>
            </div>
          </article>

          <div className="hidden lg:block lg:pt-10">
            <ArticleAside toc={toc} city={city} />
          </div>
        </div>
      </div>

      {author && <AskAuthorBar author={author} />}
    </div>
  )
}
