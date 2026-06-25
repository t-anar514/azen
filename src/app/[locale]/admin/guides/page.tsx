import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GuideRowActions } from "@/components/admin/GuideRowActions"
import type { GuideRow } from "@/lib/supabase/types"

async function getGuides(): Promise<GuideRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("guides")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

export default async function AdminGuidesPage() {
  const guides = await getGuides()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tight">Guides</h1>
          <p className="text-muted-foreground">Manage the local guide directory shown on /guides.</p>
        </div>
        <Button asChild>
          <Link href="/admin/guides/new">+ New guide</Link>
        </Button>
      </div>

      {guides.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            No guides yet. Create your first one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {guides.map((guide) => (
            <Card key={guide.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div>
                  <p className="font-semibold">
                    {guide.name}{" "}
                    {guide.is_verified && (
                      <span className="text-xs font-normal text-primary">verified</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {guide.is_active ? "Active" : "Inactive"} · {guide.location ?? "No location"} ·{" "}
                    {guide.rating.toFixed(1)}★ ({guide.review_count})
                    {guide.profile_id && " · linked account"}
                  </p>
                </div>
                <GuideRowActions id={guide.id} isActive={guide.is_active} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
