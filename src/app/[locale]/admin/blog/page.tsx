import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HackRowActions } from "@/components/admin/HackRowActions"
import type { PostRow } from "@/lib/supabase/types"

async function getPosts(): Promise<PostRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("order_index", { ascending: true })
  return data ?? []
}

export default async function AdminBlogPage() {
  const posts = await getPosts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tight">Blog</h1>
          <p className="text-muted-foreground">Manage the posts shown on /blog.</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">+ New post</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            No posts yet. Create your first one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div>
                  <p className="font-semibold">
                    {post.title}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({post.type}{post.category ? ` · ${post.category}` : ""})
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {post.published ? "Published" : "Draft"} · order {post.order_index}
                  </p>
                </div>
                <HackRowActions id={post.id} published={post.published} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
