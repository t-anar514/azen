"use client"

import * as React from "react"
import { useRouter } from "@/i18n/routing"
import { MapPin, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const DESTINATIONS = [
  { code: "NRT", label: "Нарита — Токио" },
  { code: "HND", label: "Ханэда — Токио" },
  { code: "KIX", label: "Кансай — Осака" },
  { code: "CTS", label: "Нью Читосэ — Саппоро" },
  { code: "FUK", label: "Фүкүока" },
  { code: "NGO", label: "Нагоя" },
]

export function HeroSearch() {
  const router = useRouter()
  const [dest, setDest] = React.useState("")
  const [date, setDate] = React.useState("")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (dest) params.set("airport_code", dest)
    if (date) params.set("date", date)
    // @ts-expect-error — /transfer is now in pathnames
    router.push(`/transfer${params.toString() ? `?${params}` : ""}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mt-10 w-full max-w-2xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row gap-0 rounded-2xl border border-border bg-card shadow-[0_4px_24px_rgba(22,32,43,0.10)] overflow-hidden">
        {/* Destination */}
        <label className="flex flex-1 items-center gap-3 px-4 py-3.5 sm:border-r border-b sm:border-b-0 border-border focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring/40">
          <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div className="flex flex-col min-w-0">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Нисэх онгоцны буудал</span>
            <select
              value={dest}
              onChange={e => setDest(e.target.value)}
              className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer appearance-none w-full"
            >
              <option value="">Хаана ниснэ вэ?</option>
              {DESTINATIONS.map(d => (
                <option key={d.code} value={d.code}>{d.label}</option>
              ))}
            </select>
          </div>
        </label>

        {/* Date */}
        <label className="flex items-center gap-3 px-4 py-3.5 sm:w-48 border-b sm:border-b-0 border-border focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring/40">
          <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div className="flex flex-col min-w-0">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Огноо</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="bg-transparent text-sm font-medium text-foreground outline-none w-full cursor-pointer"
            />
          </div>
        </label>

        {/* CTA */}
        <div className="p-2">
          <Button
            type="submit"
            variant="reserve"
            className="w-full sm:w-auto h-full min-h-[48px] rounded-xl px-6 font-semibold"
          >
            <span className="hidden sm:inline">Захиалах</span>
            <ArrowRight className="h-4 w-4 sm:ml-1" />
          </Button>
        </div>
      </div>
    </form>
  )
}
