import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HackForm } from "@/components/admin/HackForm"
import type { HackRow, PostRow } from "@/lib/supabase/types"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single<PostRow>()

  if (!post) notFound()

  // HackForm still speaks the hacks field model; posts stores summary as excerpt
  const formRow = { ...post, summary: post.excerpt } as unknown as HackRow

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">Edit {post.title}</h1>
      <HackForm hack={formRow} />
    </div>
  )
}
