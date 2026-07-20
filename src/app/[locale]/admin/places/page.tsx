import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlaceRowActions } from "@/components/admin/PlaceRowActions"
import type { PlaceRow } from "@/lib/supabase/types"

interface Props {
  searchParams: Promise<{ city?: string }>
}

export default async function AdminPlacesPage({ searchParams }: Props) {
  const { city } = await searchParams
  const supabase = await createClient()

  const [placesRes, citiesRes] = await Promise.all([
    (() => {
      let q = supabase
        .from("places")
        .select("*")
        .order("city_id", { ascending: true })
        .order("order_index", { ascending: true })
      if (city) q = q.eq("city_id", city)
      return q
    })(),
    supabase.from("cities").select("id, name").order("order_index"),
  ])

  const places = (placesRes.data ?? []) as PlaceRow[]
  const cities = citiesRes.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tight">Places</h1>
          <p className="text-muted-foreground">
            POIs for the city hubs — things to do, eat, nightlife.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/places/import">CSV import</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/places/new">+ New place</Link>
          </Button>
        </div>
      </div>

      {/* City filter chips */}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant={!city ? "secondary" : "ghost"} size="sm" className="rounded-full">
          <Link href="/admin/places">All</Link>
        </Button>
        {cities.map((c) => (
          <Button
            key={c.id}
            asChild
            variant={city === c.id ? "secondary" : "ghost"}
            size="sm"
            className="rounded-full"
          >
            <Link href={`/admin/places?city=${c.id}`}>{c.name}</Link>
          </Button>
        ))}
      </div>

      {places.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            No places yet{city ? ` for ${city}` : ""}. Use the CSV importer to load them in bulk.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {places.map((place) => (
            <Card key={place.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div>
                  <p className="font-semibold">
                    {place.name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({place.city_id} · {place.category}
                      {place.neighborhood ? ` · ${place.neighborhood}` : ""})
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {place.published ? "Published" : "Draft"}
                    {place.is_hidden_gem ? " · hidden gem" : ""} · order {place.order_index}
                  </p>
                </div>
                <PlaceRowActions id={place.id} published={place.published} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
