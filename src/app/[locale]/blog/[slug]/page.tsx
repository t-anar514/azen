import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HackHero } from "@/components/blog/HackHero";
import { QuickFix } from "@/components/blog/QuickFix";
import { StepGuide } from "@/components/blog/StepGuide";
import { ProTip } from "@/components/blog/ProTip";
import { PostBody } from "@/components/blog/PostBody";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import type { PostRow } from "@/lib/supabase/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single<PostRow>();

  if (!post) {
    notFound();
  }

  const relatedIds = post.related_ids ?? [];
  const { data: relatedPosts } = relatedIds.length
    ? await supabase.from("posts").select("*").in("id", relatedIds)
    : { data: [] };

  const isHack = post.type === "hack";

  return (
    <div className="min-h-screen bg-background">
      <HackHero
        title={post.title}
        category={post.category ?? ""}
        coverImage={post.cover_image ?? ""}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-20">
        {isHack ? (
          <>
            <section>
              <QuickFix summary={post.excerpt ?? ""} />
            </section>

            <section>
              <StepGuide steps={post.steps} />
            </section>

            {post.pro_tip && (
              <section>
                <ProTip text={post.pro_tip} />
              </section>
            )}
          </>
        ) : (
          <section>
            <PostBody body={post.body_md ?? post.excerpt ?? ""} />
          </section>
        )}

        <section className="pt-10 border-t border-secondary/10">
          <RelatedPosts posts={relatedPosts ?? []} />
        </section>
      </div>

      <footer className="bg-surface py-12 px-4 border-t border-secondary/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h4 className="text-primary font-bold uppercase tracking-widest text-sm">
            Azen Blog
          </h4>
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} Azen Travel Guide. Master Japan like a local.
          </p>
        </div>
      </footer>
    </div>
  );
}
