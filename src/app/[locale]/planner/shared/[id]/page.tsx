import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SharedItineraryView } from "@/components/planner/SharedItineraryView"
import type { ItemType } from "@/components/planner/Timeline"
import { FALLBACK_RATES, type Rates } from "@/lib/currency/format"

interface Props {
  params: Promise<{ id: string }>
}

export default async function SharedItineraryPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from("itineraries")
    .select("title, items, settings, is_public")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle()

  if (!trip) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground">
              Энэ аяллын хуваалцсан холбоос олдсонгүй, эсвэл нийтэд харагдахаар тохируулаагүй
              байна.
            </p>
            <Button asChild variant="outline">
              <Link href="/planner">Шинэ аялал төлөвлөх</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const items = (trip.items ?? []) as ItemType[]
  const settings = (trip.settings ?? {}) as { defaultCurrency?: "MNT" | "USD" | "JPY" }

  // Cached FX snapshot (refreshed daily by /api/cron/exchange-rates). Falls
  // back to the compile-time seed if the row is missing or the query fails —
  // never blank or crash over a currency label.
  const { data: fxRow } = await supabase
    .from("exchange_rates")
    .select("rates, fetched_at")
    .eq("id", 1)
    .maybeSingle()

  return (
    <SharedItineraryView
      title={trip.title}
      items={items}
      currency={settings.defaultCurrency ?? "JPY"}
      rates={(fxRow?.rates as Rates | undefined) ?? FALLBACK_RATES}
      ratesFetchedAt={fxRow?.fetched_at ?? null}
    />
  )
}
