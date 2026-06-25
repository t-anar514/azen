import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FlightDealRowActions } from "@/components/admin/FlightDealRowActions"
import type { FlightDealRow } from "@/lib/supabase/types"

async function getDeals(): Promise<FlightDealRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("flight_deals")
    .select("*")
    .order("order_index", { ascending: true })
  return data ?? []
}

export default async function AdminFlightsPage() {
  const deals = await getDeals()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tight">Flights</h1>
          <p className="text-muted-foreground">
            Curated cheap-flight deals shown on /flights. This is the manual stand-in for the
            future scraper — see src/lib/flights/provider.ts for the swap point.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/flights/new">+ New deal</Link>
        </Button>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            No flight deals yet. Create your first one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <Card key={deal.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div>
                  <p className="font-semibold">
                    {deal.origin_city} → {deal.destination_city}{" "}
                    {!deal.is_active && <span className="text-xs font-normal text-muted-foreground">(inactive)</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {deal.airline ?? "Unknown airline"} ·{" "}
                    {new Intl.NumberFormat("mn-MN").format(deal.price)} {deal.currency}
                    {deal.depart_date && ` · departs ${deal.depart_date}`}
                  </p>
                </div>
                <FlightDealRowActions id={deal.id} isActive={deal.is_active} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
