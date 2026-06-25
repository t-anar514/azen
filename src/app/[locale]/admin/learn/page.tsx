import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PhraseCollectionRowActions } from "@/components/admin/PhraseCollectionRowActions"
import type { PhraseCollectionRow } from "@/lib/supabase/types"

async function getCollections(): Promise<PhraseCollectionRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("phrase_collections")
    .select("*")
    .order("order_index", { ascending: true })
  return data ?? []
}

export default async function AdminLearnPage() {
  const collections = await getCollections()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tight">Learn (Phrasebook)</h1>
          <p className="text-muted-foreground">Manage the phrase collections shown on /learn.</p>
        </div>
        <Button asChild>
          <Link href="/admin/learn/new">+ New collection</Link>
        </Button>
      </div>

      {collections.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            No collections yet. Create your first one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {collections.map((collection) => (
            <Card key={collection.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div>
                  <p className="font-semibold">
                    {collection.title}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({collection.phrases.length} phrases)
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {collection.published ? "Published" : "Draft"} · order {collection.order_index}
                  </p>
                </div>
                <PhraseCollectionRowActions id={collection.id} published={collection.published} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
