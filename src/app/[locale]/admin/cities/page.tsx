import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CityRowActions } from "@/components/admin/CityRowActions"
import type { CityRow } from "@/lib/supabase/types"

async function getCities(): Promise<CityRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("cities")
    .select("*")
    .order("order_index", { ascending: true })
  return data ?? []
}

export default async function AdminCitiesPage() {
  const cities = await getCities()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tight">Essentials (Cities)</h1>
          <p className="text-muted-foreground">Manage the city guides shown on /essentials.</p>
        </div>
        <Button asChild>
          <Link href="/admin/cities/new">+ New city</Link>
        </Button>
      </div>

      {cities.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            No cities yet. Create your first one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cities.map((city) => (
            <Card key={city.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div>
                  <p className="font-semibold">
                    {city.name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">({city.id})</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {city.published ? "Published" : "Draft"} · order {city.order_index}
                  </p>
                </div>
                <CityRowActions id={city.id} published={city.published} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
