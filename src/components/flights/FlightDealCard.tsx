import Link from "next/link"
import { Plane, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { FlightDealRow } from "@/lib/supabase/types"

function formatPrice(price: number, currency: string) {
  return `${new Intl.NumberFormat("mn-MN").format(price)} ${currency}`
}

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString("mn-MN", { month: "short", day: "numeric", year: "numeric" })
}

interface FlightDealCardProps {
  deal: FlightDealRow
}

export function FlightDealCard({ deal }: FlightDealCardProps) {
  const depart = formatDate(deal.depart_date)
  const ret = formatDate(deal.return_date)

  // airport_code pre-selects the pickup airport on the booking form (see
  // TransferBookingForm) — only set it when the deal has a known code, since
  // the form falls back to its own default otherwise.
  const pickupParams = new URLSearchParams()
  if (deal.destination_code) pickupParams.set("airport_code", deal.destination_code)
  if (deal.depart_date) pickupParams.set("date", deal.depart_date)

  return (
    <Card className="overflow-hidden border-border/20 transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Plane className="h-4 w-4 text-primary" />
            {deal.origin_city} <ArrowRight className="h-3.5 w-3.5 text-gray-400" /> {deal.destination_city}
          </div>
          {deal.airline && (
            <span className="rounded-full bg-muted/10 px-2.5 py-1 text-xs font-medium text-foreground">
              {deal.airline}
            </span>
          )}
        </div>

        <div>
          <p className="text-3xl font-black text-primary">{formatPrice(deal.price, deal.currency)}</p>
          {depart && (
            <p className="text-sm text-gray-500">
              {depart}
              {ret ? ` – ${ret}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <a href={deal.deal_url} target="_blank" rel="noopener noreferrer">
              Тийз авах
            </a>
          </Button>
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <Link href={pickupParams.toString() ? `/transfer?${pickupParams}` : "/transfer"}>
              Хүргэх/Тосох нэмэх
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
