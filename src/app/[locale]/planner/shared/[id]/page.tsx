import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SharedItineraryView } from "@/components/planner/SharedItineraryView"
import type { ItemType } from "@/components/planner/Timeline"

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

  return (
    <SharedItineraryView
      title={trip.title}
      items={items}
      currency={settings.defaultCurrency ?? "JPY"}
    />
  )
}
