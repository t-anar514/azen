"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// State B — recovery path for guests who lost their confirmation link. Posts
// trip code + contact to /api/bookings/lookup, and on a verified match jumps
// to the existing live-tracking page for that booking.
export function GuestBookingLookup() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [tripCode, setTripCode] = useState("")
  const [contact, setContact] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip_code: tripCode, contact }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Захиалга олдсонгүй.")
      router.push(`/transfer/trip/${json.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Захиалга олдсонгүй.")
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <Search className="h-4 w-4" />
        Захиалгатай юу? Хайх
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm"
        >
          <div className="space-y-1.5">
            <Label htmlFor="lookup_trip_code">Аяллын код</Label>
            <Input
              id="lookup_trip_code"
              placeholder="AZ-7K2P9Q"
              required
              value={tripCode}
              onChange={(e) => setTripCode(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lookup_contact">Захиалгад ашигласан имэйл эсвэл утас</Label>
            <Input
              id="lookup_contact"
              placeholder="email@example.com / 9911xxxx"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="message" className="w-full" disabled={submitting}>
            {submitting ? "Хайж байна…" : "Захиалгаа харах"}
          </Button>
        </form>
      )}
    </div>
  )
}
