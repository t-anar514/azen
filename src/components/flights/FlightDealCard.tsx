import Link from "next/link"
import { Plane, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { airportLabel } from "@/lib/flights/provider"
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

  const pickupParams = new URLSearchParams({
    pickup_location: airportLabel(deal.destination_code, deal.destination_city),
  })
  if (deal.depart_date) pickupParams.set("date", deal.depart_date)

  return (
    <Card className="overflow-hidden border-[#88a47c]/20 transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1c315e]">
            <Plane className="h-4 w-4 text-[#227c70]" />
            {deal.origin_city} <ArrowRight className="h-3.5 w-3.5 text-gray-400" /> {deal.destination_city}
          </div>
          {deal.airline && (
            <span className="rounded-full bg-[#88a47c]/10 px-2.5 py-1 text-xs font-medium text-[#1c315e]">
              {deal.airline}
            </span>
          )}
        </div>

        <div>
          <p className="text-3xl font-black text-[#227c70]">{formatPrice(deal.price, deal.currency)}</p>
          {depart && (
            <p className="text-sm text-gray-500">
              {depart}
              {ret ? ` – ${ret}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild className="bg-[#1c315e] hover:bg-[#1c315e]/90">
            <a href={deal.deal_url} target="_blank" rel="noopener noreferrer">
              Тийз авах
            </a>
          </Button>
          <Button asChild variant="outline" className="border-[#227c70] text-[#227c70] hover:bg-[#227c70]/10">
            <Link href={`/transfer?${pickupParams.toString()}`}>
              Аэропортын хүргэлт нэмэх
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
