import Link from "next/link"
import { ArrowRight, Plane } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { FlightDealRow } from "@/lib/supabase/types"

function formatPrice(price: number, currency: string) {
  return `${new Intl.NumberFormat("mn-MN").format(price)} ${currency}`
}

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" })
}

interface FlightDealCardProps {
  deal: FlightDealRow
}

export function FlightDealCard({ deal }: FlightDealCardProps) {
  const depart = formatDate(deal.depart_date)
  const ret = formatDate(deal.return_date)

  // airport_code pre-selects the pickup airport on the booking form (see
  // TransferBookingForm) — only set it when the deal has a known code.
  const pickupParams = new URLSearchParams()
  if (deal.destination_code) pickupParams.set("airport_code", deal.destination_code)
  if (deal.depart_date) pickupParams.set("date", deal.depart_date)

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-display font-bold text-foreground">
          <Plane className="size-4 text-primary" />
          {deal.destination_city}
        </div>
        {deal.airline && (
          <span className="rounded-pill bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {deal.airline}
          </span>
        )}
      </div>

      <div>
        <p className="font-display text-2xl font-extrabold text-primary">
          {formatPrice(deal.price, deal.currency)}
        </p>
        {depart && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            {deal.origin_city}
            <ArrowRight className="size-3.5" />
            {deal.destination_city} · {depart}
            {ret ? ` – ${ret}` : ""}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Button asChild variant="reserve" className="flex-1 rounded-pill">
          <a href={deal.deal_url} target="_blank" rel="noopener noreferrer">
            Тийз авах
          </a>
        </Button>
        <Button asChild variant="outline" className="flex-1 rounded-pill">
          <Link href={pickupParams.toString() ? `/transfer?${pickupParams}` : "/transfer"}>
            Тосох нэмэх
          </Link>
        </Button>
      </div>
    </div>
  )
}
