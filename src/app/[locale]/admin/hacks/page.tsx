import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HackRowActions } from "@/components/admin/HackRowActions"
import type { HackRow } from "@/lib/supabase/types"

async function getHacks(): Promise<HackRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("hacks")
    .select("*")
    .order("order_index", { ascending: true })
  return data ?? []
}

export default async function AdminHacksPage() {
  const hacks = await getHacks()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tight">Hacks</h1>
          <p className="text-muted-foreground">Manage the travel hacks shown on /hacks.</p>
        </div>
        <Button asChild>
          <Link href="/admin/hacks/new">+ New hack</Link>
        </Button>
      </div>

      {hacks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            No hacks yet. Create your first one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {hacks.map((hack) => (
            <Card key={hack.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div>
                  <p className="font-semibold">
                    {hack.title}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({hack.category})
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hack.published ? "Published" : "Draft"} · order {hack.order_index}
                  </p>
                </div>
                <HackRowActions id={hack.id} published={hack.published} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
