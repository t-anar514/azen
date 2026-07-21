"use client"

import * as React from "react"

import { FlightDealCard } from "@/components/flights/FlightDealCard"
import { cn } from "@/lib/utils"
import type { FlightDealRow } from "@/lib/supabase/types"

/** Destination filter chips + deal grid (design doc, Screen 06). */
export function FlightsDirectory({ deals }: { deals: FlightDealRow[] }) {
  const [dest, setDest] = React.useState<string>("all")

  const destinations = React.useMemo(
    () => [...new Set(deals.map((d) => d.destination_city))],
    [deals]
  )

  const filtered = dest === "all" ? deals : deals.filter((d) => d.destination_city === dest)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Chip label="Бүх чиглэл" active={dest === "all"} onClick={() => setDest("all")} />
        {destinations.map((d) => (
          <Chip key={d} label={d} active={dest === d} onClick={() => setDest(d)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-card border border-dashed border-border p-12 text-center text-muted-foreground">
          Энэ чиглэлд одоогоор санал алга байна.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((deal) => (
            <FlightDealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill border px-4 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  )
}
