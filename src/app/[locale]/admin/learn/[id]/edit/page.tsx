import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PhraseCollectionForm } from "@/components/admin/PhraseCollectionForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPhraseCollectionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: collection } = await supabase
    .from("phrase_collections")
    .select("*")
    .eq("id", id)
    .single()

  if (!collection) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">Edit {collection.title}</h1>
      <PhraseCollectionForm collection={collection} />
    </div>
  )
}
