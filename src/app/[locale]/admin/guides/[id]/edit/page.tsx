import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GuideForm } from "@/components/admin/GuideForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditGuidePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: guide } = await supabase.from("guides").select("*").eq("id", id).single()

  if (!guide) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">Edit {guide.name}</h1>
      <GuideForm guide={guide} />
    </div>
  )
}
