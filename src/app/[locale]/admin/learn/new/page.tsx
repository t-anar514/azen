import { PhraseCollectionForm } from "@/components/admin/PhraseCollectionForm"

export default function NewPhraseCollectionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">New collection</h1>
      <PhraseCollectionForm />
    </div>
  )
}
