import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HackForm } from "@/components/admin/HackForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditHackPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: hack } = await supabase.from("hacks").select("*").eq("id", id).single()

  if (!hack) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">Edit {hack.title}</h1>
      <HackForm hack={hack} />
    </div>
  )
}
