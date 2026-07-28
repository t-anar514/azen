"use client"

import { Suspense, useEffect, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Bus, Car, Caravan, Check, Clock, MapPin, MessageCircle, Route } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { RouteMap } from "@/components/transfer/RouteMap"
import { AvailabilityPicker } from "@/components/transfer/AvailabilityPicker"
import { RouteRecap, StepRail, type BookingStep } from "@/components/transfer/BookingSteps"
import { cn } from "@/lib/utils"
import { slotMeta, toDateKey, type ShiftSlot } from "@/lib/drivers/shifts"
import { formatTransferPrice } from "@/lib/transfers/format"
import { AIRPORTS, AIRPORT_NAMES, AIRPORT_COORDS } from "@/lib/transfers/airports"
import { geocode, zoneLabelToQuery, type GeocodeResult } from "@/lib/transfers/geocode"
import { getDrivingRoute, type RouteResult } from "@/lib/transfers/route"
import type { VehicleOptionRow, FlightDirection, TransferZoneRow, PricingSource } from "@/lib/supabase/types"

interface TransferBookingFormProps {
  vehicleOptions: VehicleOptionRow[]
}

interface Quote {
  price: number
  currency: string
  distanceKm: number | null
  source: PricingSource
}

const CUSTOM_DESTINATION = "custom"
// The team's WhatsApp line (from the fixed-quote reference). Used only for the
// optional "ask" link — booking always goes through /api/bookings.
const WHATSAPP_NUMBER = "818047891812"

// Icon per vehicle tier, keyed by the seeded ids (see 0005/0017). Decorative.
const VEHICLE_ICONS: Record<string, LucideIcon> = {
  sedan: Car,
  minivan: Caravan,
  premium: Bus,
}

const PASSENGER_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9+"]
const LUGGAGE_OPTIONS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9+"]

function formatDateTime(value: string) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString("mn-MN", { dateStyle: "medium", timeStyle: "short" })
}

function Form({ vehicleOptions }: TransferBookingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [flightNumber, setFlightNumber] = useState("")
  const [flightDirection, setFlightDirection] = useState<FlightDirection>("arrival")
  const [pickupDatetime, setPickupDatetime] = useState("")
  // The date is no longer free-form: it comes from the shift calendar, and the
  // slot travels with it so the API can claim capacity against the same row the
  // traveler was shown.
  const [shiftSlot, setShiftSlot] = useState<ShiftSlot | null>(null)

  const [airportCode, setAirportCode] = useState(
    () => searchParams.get("airport_code") ?? AIRPORTS[0]?.code ?? ""
  )
  const [zones, setZones] = useState<TransferZoneRow[]>([])
  const [zonesLoading, setZonesLoading] = useState(true)
  // "" while zones are still loading, a zone id once one is auto-picked, or
  // CUSTOM_DESTINATION when the guest's destination isn't in the list.
  const [destination, setDestination] = useState<string>("")
  const [customDropoff, setCustomDropoff] = useState("")
  const [customResults, setCustomResults] = useState<GeocodeResult[]>([])
  const [showCustomResults, setShowCustomResults] = useState(false)

  const [vehicleOptionId, setVehicleOptionId] = useState(vehicleOptions[0]?.id ?? "")
  const [passengers, setPassengers] = useState("2")
  const [luggage, setLuggage] = useState("2")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoting, setQuoting] = useState(false)

  // Step chrome. `reached` is tracked separately from `step` so the rail can
  // offer a way back to a completed step without also offering a way to skip
  // one that was never satisfied.
  const [step, setStep] = useState<BookingStep>(1)
  const [reached, setReached] = useState<BookingStep>(1)

  // Map: coordinates for the dropoff pin + the drawn driving route. For a
  // curated zone this is illustrative (price comes from the zone quote); for a
  // typed address the route's distance also drives the estimate.
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [route, setRoute] = useState<RouteResult | null>(null)

  const selectedZone = zones.find((z) => z.id === destination) ?? null
  const zoneId = destination && destination !== CUSTOM_DESTINATION ? destination : null
  const airportCoords = AIRPORT_COORDS[airportCode] ?? null

  const isCustom = destination === CUSTOM_DESTINATION
  const destLabel = isCustom ? customDropoff.trim() : (selectedZone?.label ?? "")
  const destShort = isCustom
    ? (customDropoff ? customDropoff.split(",")[0] : "Хаяг")
    : (selectedZone ? selectedZone.label.split("—").pop()!.trim() : "")

  const fromPoint = airportCoords ? { ...airportCoords, label: airportCode } : null
  const toPoint = destCoords ? { ...destCoords, label: destShort } : null

  const selectedVehicle = vehicleOptions.find((v) => v.id === vehicleOptionId) ?? null

  // Live driving distance is only used for pricing when there's no curated
  // zone (a typed address). For a zone the price uses the zone's own distance.
  const customDistance = isCustom ? (route?.distanceKm ?? null) : null

  // Distance to show in the summary: the zone/estimate distance the price is
  // actually based on (from the quote), falling back to the live route.
  const summaryDistanceKm = quote?.distanceKm ?? route?.distanceKm ?? null
  const summaryDurationMin = route?.durationMin ?? null

  // Prefill the pickup date from ?date=YYYY-MM-DD (set by the home page's
  // airport search and by flight-deal cards) — only the date part, since the
  // exact time depends on the actual flight.
  useEffect(() => {
    const date = searchParams.get("date")
    if (date) setPickupDatetime((prev) => prev || `${date}T00:00`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-fetch the destination list whenever the pickup airport changes, and
  // pick a sensible default: the first curated zone if one exists, otherwise
  // fall straight to "custom" so the guest can type their own address.
  useEffect(() => {
    if (!airportCode) return
    let cancelled = false
    setZonesLoading(true)

    fetch(`/api/transfer/zones?airport_code=${encodeURIComponent(airportCode)}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        const nextZones: TransferZoneRow[] = json?.data ?? []
        setZones(nextZones)
        setDestination(nextZones[0]?.id ?? CUSTOM_DESTINATION)
      })
      .catch(() => {
        if (!cancelled) {
          setZones([])
          setDestination(CUSTOM_DESTINATION)
        }
      })
      .finally(() => {
        if (!cancelled) setZonesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [airportCode])

  // Live price preview — recomputed server-side (never trusted from here)
  // every time the destination, vehicle, or (for typed addresses) the routed
  // distance changes.
  useEffect(() => {
    if (!vehicleOptionId || zonesLoading) return
    let cancelled = false
    setQuoting(true)

    fetch("/api/transfer/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle_option_id: vehicleOptionId,
        zone_id: zoneId,
        distance_km: customDistance,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json?.data) {
          setQuote({
            price: json.data.price,
            currency: json.data.currency,
            distanceKm: json.data.distanceKm,
            source: json.data.source,
          })
        }
      })
      .catch(() => {
        if (!cancelled) setQuote(null)
      })
      .finally(() => {
        if (!cancelled) setQuoting(false)
      })

    return () => {
      cancelled = true
    }
  }, [vehicleOptionId, zoneId, zonesLoading, customDistance])

  // Resolve an approximate map pin for a curated zone by geocoding its label.
  // Custom destinations set their own coords from the autocomplete pick, so we
  // skip them here (and clear any stale zone pin when switching to custom).
  useEffect(() => {
    if (isCustom) {
      setDestCoords(null)
      return
    }
    if (!selectedZone) {
      setDestCoords(null)
      return
    }
    const ctrl = new AbortController()
    geocode(zoneLabelToQuery(selectedZone.label), { limit: 1, signal: ctrl.signal }).then((results) => {
      setDestCoords(results[0] ? { lat: results[0].lat, lng: results[0].lng } : null)
    })
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone?.id, isCustom])

  // Draw the driving route whenever both endpoints are known.
  useEffect(() => {
    if (!airportCoords || !destCoords) {
      setRoute(null)
      return
    }
    const ctrl = new AbortController()
    getDrivingRoute(airportCoords, destCoords, { signal: ctrl.signal }).then((r) => setRoute(r))
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airportCoords?.lat, airportCoords?.lng, destCoords?.lat, destCoords?.lng])

  async function handleCustomSearch(value: string) {
    setCustomDropoff(value)
    if (value.trim().length < 2) {
      setCustomResults([])
      return
    }
    const results = await geocode(value, { limit: 5 })
    setCustomResults(results)
    setShowCustomResults(true)
  }

  function pickCustomResult(result: GeocodeResult) {
    setCustomDropoff(result.label)
    setDestCoords({ lat: result.lat, lng: result.lng })
    setShowCustomResults(false)
  }

  function handleMarkerDrag(lat: number, lng: number) {
    setDestCoords({ lat, lng })
  }

  function composeNotes(): string | undefined {
    const details = [
      passengers.trim() && `Зорчигч: ${passengers.trim()}`,
      luggage.trim() && `Ачаа: ${luggage.trim()}`,
    ].filter(Boolean)
    const composed = [details.join(", "), notes.trim()].filter(Boolean).join("\n")
    return composed || undefined
  }

  const whatsappUrl = (() => {
    const lines = [
      "Сайн байна уу, Azen хүргэлтийн талаар асууя.",
      destLabel && `Маршрут: ${AIRPORT_NAMES[airportCode] ?? airportCode} → ${destLabel}`,
      flightNumber && `Нислэг: ${flightNumber}`,
      pickupDatetime && `Цаг: ${formatDateTime(pickupDatetime)}`,
      `Зорчигч: ${passengers}`,
      `Ачаа: ${luggage}`,
      quote && `Тооцоолсон үнэ: ${formatTransferPrice(quote.price, quote.currency)}`,
    ].filter(Boolean)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`
  })()

  /**
   * What each step needs before it will let go.
   *
   * Stated as "what is missing" rather than a boolean so the same rule can both
   * disable the button and say why — a Үргэлжлүүлэх that silently does nothing
   * is the worst version of this control.
   */
  function stepBlocker(target: BookingStep): string | null {
    if (target >= 2) {
      if (!destination) return "Очих газраа сонгоно уу."
      if (isCustom && !customDropoff.trim()) return "Хүргэх газрын хаягаа бичнэ үү."
      if (!vehicleOptionId) return "Тээврийн хэрэгслээ сонгоно уу."
    }
    if (target >= 3) {
      if (!datePart || !shiftSlot) return "Нээлттэй огноо болон ээлжээ сонгоно уу."
      if (!flightNumber.trim()) return "Нислэгийн дугаараа бичнэ үү."
      if (!timePart) return "Буух цагаа оруулна уу."
    }
    return null
  }

  function goToStep(target: BookingStep) {
    setError(null)
    // Backwards is always allowed — every field behind them is already valid.
    if (target <= step) {
      setStep(target)
      return
    }
    const blocker = stepBlocker(target)
    if (blocker) {
      setError(blocker)
      return
    }
    setStep(target)
    setReached((r) => (target > r ? target : r))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    // Enter inside a field on step 1 or 2 means "next", not "book". Without
    // this the form would place an order from a screen that never showed the
    // traveler a price to agree to.
    if (step < 3) {
      goToStep((step + 1) as BookingStep)
      return
    }

    if (isCustom && !customDropoff.trim()) {
      setError("Хүргэх газрын хаягаа бичнэ үү.")
      return
    }

    // Validated here rather than via native `required`: the same fields render
    // in both the mobile and desktop layouts and one is always display:none,
    // and a hidden required control silently blocks submit in Chrome.
    if (!pickupDatetime || !flightNumber.trim() || !guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setError("Огноо, нислэг, нэр, имэйл, утас — шаардлагатай талбаруудыг бөглөнө үү.")
      return
    }

    if (!shiftSlot) {
      setError("Нээлттэй огноо болон ээлжээ сонгоно уу.")
      return
    }

    setSubmitting(true)

    const dropoffLocation = isCustom ? customDropoff.trim() : (selectedZone?.label ?? customDropoff.trim())

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          flight_number: flightNumber,
          flight_direction: flightDirection,
          pickup_datetime: pickupDatetime,
          shift_date: datePart,
          shift_slot: shiftSlot,
          pickup_location: AIRPORT_NAMES[airportCode] ?? airportCode,
          dropoff_location: dropoffLocation,
          vehicle_option_id: vehicleOptionId,
          zone_id: zoneId,
          distance_km: customDistance,
          notes: composeNotes(),
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Захиалга үүсгэхэд алдаа гарлаа.")

      router.push(`/transfer/confirmation/${json.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Захиалга үүсгэхэд алдаа гарлаа.")
      setSubmitting(false)
    }
  }

  const selectClassName =
    "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer"

  const airportFieldLabel =
    flightDirection === "arrival" ? "Нисэх буудал (авах)" : "Нисэх буудал (хүргэх)"
  const destFieldLabel = flightDirection === "arrival" ? "Очих газар" : "Гарах газар"
  const dateFieldLabel = flightDirection === "arrival" ? "Буух огноо, цаг" : "Нисэх огноо, цаг"

  const priceText = quoting && !quote ? "…" : quote ? formatTransferPrice(quote.price, quote.currency) : "—"

  // Carried into steps 2 and 3, where the fields that produced them are gone.
  const recapRoute = `${AIRPORT_NAMES[airportCode] ?? airportCode} → ${destShort || "—"}`
  const recapDetail = [selectedVehicle?.name, `${passengers} зорчигч`, `${luggage} тээш`]
    .filter(Boolean)
    .join(" · ")

  // The mobile layout shows date and time as two separate chips; both write
  // back into the single `pickupDatetime` (YYYY-MM-DDTHH:mm) the API expects.
  const datePart = pickupDatetime.split("T")[0] ?? ""
  const timePart = pickupDatetime.split("T")[1] ?? ""
  const setTimePart = (tm: string) =>
    setPickupDatetime(`${datePart || toDateKey(new Date())}T${tm}`)

  /**
   * Calendar → form. Picking a slot seeds the time with that window's opening
   * hour when none has been typed yet, so a traveler who never touches the
   * "Буух цаг" field still produces a pickup that sits inside the slot they
   * chose rather than at 00:00 the night before.
   */
  function handleShiftChange({ date, slot }: { date: string; slot: ShiftSlot | null }) {
    const time = timePart || (slot ? `${String(slotMeta(slot).startHour).padStart(2, "0")}:00` : "00:00")
    setPickupDatetime(`${date}T${time}`)
    setShiftSlot(slot)
  }

  return (
    <form onSubmit={handleSubmit} className="pb-24 lg:pb-0">
      {/* ═══════════ MOBILE LAYOUT (design doc, Screen 13) ═══════════ */}
      <div className="space-y-4 md:hidden">
        <StepRail current={step} reached={reached} onJump={goToStep} />

        {step > 1 && (
          <RouteRecap
            route={recapRoute}
            detail={recapDetail}
            price={priceText}
            onEdit={() => goToStep(1)}
          />
        )}

        {/* ── Step 1 · Чиглэл ── */}
        <div className={cn("space-y-4", step !== 1 && "hidden")}>
        {/* route card with dot-line connector */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-1.5">
              <span className="size-2.5 rounded-full border-[2.5px] border-primary" />
              <span className="my-1 h-6 w-0.5 bg-border" />
              <span className="size-2.5 rounded-full bg-saffron" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="border-b border-[#F1F5F9] pb-3">
                <div className="text-[10.5px] font-bold uppercase tracking-wide text-[#94A3B8]">
                  {flightDirection === "arrival" ? "Хаанаас" : "Хаашаа"}
                </div>
                <select
                  aria-label={airportFieldLabel}
                  value={airportCode}
                  onChange={(e) => setAirportCode(e.target.value)}
                  className="mt-0.5 w-full appearance-none bg-transparent text-[14.5px] font-bold text-foreground outline-none"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-3">
                <div className="text-[10.5px] font-bold uppercase tracking-wide text-[#94A3B8]">
                  {flightDirection === "arrival" ? "Хаашаа" : "Хаанаас"}
                </div>
                <select
                  aria-label={destFieldLabel}
                  value={destination}
                  disabled={zonesLoading}
                  onChange={(e) => setDestination(e.target.value)}
                  className="mt-0.5 w-full appearance-none bg-transparent text-[14.5px] font-bold text-foreground outline-none disabled:opacity-60"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label}
                    </option>
                  ))}
                  <option value={CUSTOM_DESTINATION}>Өөрөө хаяг оруулах</option>
                </select>
              </div>
            </div>
          </div>
          {isCustom && (
            <div className="relative mt-3">
              <Input
                placeholder="Буудлын нэр / хаяг"
                value={customDropoff}
                onChange={(e) => handleCustomSearch(e.target.value)}
                onFocus={() => customResults.length > 0 && setShowCustomResults(true)}
                onBlur={() => setTimeout(() => setShowCustomResults(false), 200)}
              />
              {showCustomResults && customResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                  {customResults.map((r, i) => (
                    <button
                      key={`${r.lat}-${r.lng}-${i}`}
                      type="button"
                      className="flex w-full items-start gap-2 border-b border-border/60 p-2.5 text-left last:border-b-0 hover:bg-secondary"
                      onClick={() => pickCustomResult(r)}
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                      <span className="min-w-0 text-sm text-foreground">{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* passengers chip */}
        <div className="flex gap-2.5">
          <label className="flex-1 rounded-xl border border-border bg-card px-2 py-2 text-center">
            <span className="block text-[10.5px] text-[#94A3B8]">Хүн</span>
            <select
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="w-full appearance-none bg-transparent text-center text-[13px] font-bold text-foreground outline-none"
            >
              {PASSENGER_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* vehicle picker */}
        <div>
          <h2 className="mb-3 font-display text-[15px] font-extrabold text-foreground">
            Тээврийн хэрэгсэл сонго
          </h2>
          <div className="flex flex-col gap-2.5">
            {vehicleOptions.map((vehicle) => {
              const Icon = VEHICLE_ICONS[vehicle.id] ?? Car
              const selected = vehicleOptionId === vehicle.id
              return (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => setVehicleOptionId(vehicle.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl p-3.5 text-left transition-colors",
                    selected ? "border-2 border-primary" : "border border-border"
                  )}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <Icon className="size-6 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[14.5px] font-bold text-foreground">{vehicle.name}</div>
                    {vehicle.description && (
                      <div className="text-[11.5px] text-muted-foreground">{vehicle.description}</div>
                    )}
                  </div>
                  <div className="shrink-0 font-display text-[15px] font-extrabold text-foreground">
                    {formatTransferPrice(vehicle.price, vehicle.currency)}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        </div>

        {/* ── Step 2 · Огноо ба ээлж ── */}
        <div className={cn("space-y-4", step !== 2 && "hidden")}>
        {/* open dates + slot */}
        <AvailabilityPicker date={datePart} slot={shiftSlot} onChange={handleShiftChange}>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="rounded-xl border border-border bg-card px-2 py-2 text-center">
              <span className="block text-[10.5px] text-[#94A3B8]">Нислэгийн дугаар</span>
              <input
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="JL302"
                className="w-full bg-transparent text-center text-[13px] font-bold text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground"
              />
            </label>
            <label className="rounded-xl border border-border bg-card px-2 py-2 text-center">
              <span className="block text-[10.5px] text-[#94A3B8]">
                {flightDirection === "arrival" ? "Буух цаг" : "Нисэх цаг"}
              </span>
              <input
                type="time"
                value={timePart}
                onChange={(e) => setTimePart(e.target.value)}
                className="w-full bg-transparent text-center text-[13px] font-bold text-foreground outline-none"
              />
            </label>
          </div>
        </AvailabilityPicker>
        </div>

        {/* ── Step 3 · Төлбөр ── */}
        <div className={cn("space-y-4", step !== 3 && "hidden")}>
        {/* required booking details (kept below — the estimate view omits them) */}
        <div className="space-y-3 border-t border-border pt-4">
          {/* Flight number moved up into the shift block, where the landing
              time it pairs with now lives. */}
          <p className="text-sm font-semibold text-foreground">Захиалгын мэдээлэл</p>
          <Input placeholder="Нэр" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="email" placeholder="Имэйл" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
            <Input type="tel" placeholder="Утас" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
          </div>
        </div>
        </div>

        {/* The error belongs outside the step panels — a blocker raised while
            leaving step 1 must still be readable from step 1. */}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => goToStep((step - 1) as BookingStep)}
          >
            Буцах
          </Button>
        )}
      </div>

      {/* ═══════════ DESKTOP LAYOUT ═══════════ */}
      <div className="hidden gap-6 md:grid lg:grid-cols-[1fr_360px]">
      {/* ─────────── LEFT: booking details ─────────── */}
      <Card>
        <CardContent className="space-y-5 pt-6">
          <StepRail current={step} reached={reached} onJump={goToStep} />

          {step > 1 && (
            <RouteRecap
              route={recapRoute}
              detail={recapDetail}
              price={priceText}
              onEdit={() => goToStep(1)}
            />
          )}

          {/* ── Step 1 · Чиглэл ── */}
          <div className={cn("space-y-5", step !== 1 && "hidden")}>
          {/* direction pill toggle */}
          <div className="inline-flex rounded-full bg-secondary p-1">
            <button
              type="button"
              onClick={() => setFlightDirection("arrival")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                flightDirection === "arrival"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Онгоц буух (тосох)
            </button>
            <button
              type="button"
              onClick={() => setFlightDirection("departure")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                flightDirection === "departure"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Онгоц нисэх (үдэх)
            </button>
          </div>

          {/* airport + destination */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="airport_code">{airportFieldLabel}</Label>
              <select
                id="airport_code"
                className={selectClassName}
                value={airportCode}
                onChange={(e) => setAirportCode(e.target.value)}
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">{destFieldLabel}</Label>
              <select
                id="destination"
                className={selectClassName}
                value={destination}
                disabled={zonesLoading}
                onChange={(e) => setDestination(e.target.value)}
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
                <option value={CUSTOM_DESTINATION}>Жагсаалтад байхгүй — өөрөө хаяг оруулах</option>
              </select>
            </div>
          </div>

          {isCustom && (
            <div className="relative space-y-1">
              <Input
                placeholder="Буудлын нэр / хаяг"
                value={customDropoff}
                onChange={(e) => handleCustomSearch(e.target.value)}
                onFocus={() => customResults.length > 0 && setShowCustomResults(true)}
                onBlur={() => setTimeout(() => setShowCustomResults(false), 200)}
              />
              {showCustomResults && customResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                  {customResults.map((r, i) => (
                    <button
                      key={`${r.lat}-${r.lng}-${i}`}
                      type="button"
                      className="flex w-full items-start gap-2 border-b border-border/60 p-2.5 text-left last:border-b-0 hover:bg-secondary"
                      onClick={() => pickCustomResult(r)}
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                      <span className="min-w-0 text-sm text-foreground">{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Энэ хаяг тогтмол чиглэлийн жагсаалтад байхгүй тул үнийг зайд үндэслэн тооцов — эцсийн
                үнийг бид тантай холбогдож баталгаажуулна.
              </p>
            </div>
          )}

          {/* vehicle picker */}
          <div className="space-y-2">
            <Label>Тээврийн хэрэгсэл</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {vehicleOptions.map((vehicle) => {
                const Icon = VEHICLE_ICONS[vehicle.id] ?? Car
                const selected = vehicleOptionId === vehicle.id
                return (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => setVehicleOptionId(vehicle.id)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-colors sm:flex-col sm:items-start sm:gap-1 sm:p-3",
                      selected ? "border-primary bg-secondary" : "border-border hover:border-primary/50"
                    )}
                  >
                    {selected && (
                      <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="size-3" />
                      </span>
                    )}
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary sm:size-auto sm:bg-transparent sm:p-0">
                      <Icon className="size-5 text-foreground" />
                    </span>
                    <div className="min-w-0 flex-1 sm:flex-none">
                      <p className="font-semibold text-foreground">{vehicle.name}</p>
                      {vehicle.description && (
                        <p className="text-xs text-muted-foreground">{vehicle.description}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-sm font-bold text-foreground sm:mt-1">
                      {formatTransferPrice(vehicle.price, vehicle.currency)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* passengers + luggage */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="passengers">Зорчигчид</Label>
              <select
                id="passengers"
                className={selectClassName}
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
              >
                {PASSENGER_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} хүн
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="luggage">Ачаа</Label>
              <select
                id="luggage"
                className={selectClassName}
                value={luggage}
                onChange={(e) => setLuggage(e.target.value)}
              >
                {LUGGAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} чемодан
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Нэмэлт тэмдэглэл</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Хүүхдийн суудал, олон зогсоол гэх мэт…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          </div>

          {/* ── Step 2 · Огноо ба ээлж ── */}
          {/* Hidden rather than unmounted: AvailabilityPicker fetches a month of
              capacity on mount, and stepping back and forth would re-request it
              every time. The same reason keeps step 1 mounted — the map and the
              live quote both hang off effects in there. */}
          <div className={cn("space-y-5", step !== 2 && "hidden")}>
          {/* open dates + slot, then the flight it has to line up with */}
          <div className="space-y-2">
            <Label>{dateFieldLabel}</Label>
            <AvailabilityPicker date={datePart} slot={shiftSlot} onChange={handleShiftChange}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="flight_number">Нислэгийн дугаар</Label>
                  <Input
                    id="flight_number"
                    placeholder="JL302"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup_time">
                    {flightDirection === "arrival" ? "Буух цаг" : "Нисэх цаг"}
                  </Label>
                  <Input
                    id="pickup_time"
                    type="time"
                    value={timePart}
                    onChange={(e) => setTimePart(e.target.value)}
                  />
                </div>
              </div>
            </AvailabilityPicker>
          </div>
          </div>

          {/* ── Step 3 · Төлбөр ── */}
          <div className={cn("space-y-5", step !== 3 && "hidden")}>
          {/* contact — required to place the booking */}
          <div className="space-y-4 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">Холбоо барих мэдээлэл</p>
            <div className="space-y-2">
              <Label htmlFor="guest_name">Нэр</Label>
              <Input id="guest_name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guest_email">Имэйл</Label>
                <Input
                  id="guest_email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest_phone">Утасны дугаар</Label>
                <Input
                  id="guest_phone"
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
          </div>

          {/* step nav — the order itself is placed from the summary card */}
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => goToStep((step - 1) as BookingStep)}
              >
                Буцах
              </Button>
            ) : (
              <span />
            )}
            {step < 3 && (
              <Button type="button" onClick={() => goToStep((step + 1) as BookingStep)}>
                Үргэлжлүүлэх
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─────────── RIGHT: map + order summary ─────────── */}
      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="overflow-hidden rounded-xl">
          <RouteMap
            from={fromPoint}
            to={toPoint}
            routeGeometry={route?.geometry ?? null}
            onDestinationDragEnd={handleMarkerDrag}
            heightClass="h-[180px]"
          />
        </div>
        {isCustom && (
          <p className="px-1 text-xs text-muted-foreground">
            Зүү таны байршилд яг тохирохгүй бол улаан зүүг чирж тохируулна уу.
          </p>
        )}

        <Card>
          <CardContent className="space-y-3 pt-6">
            <h2 className="font-display text-base font-bold text-foreground">Захиалгын дүн</h2>

            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0 text-muted-foreground">
                {selectedVehicle?.name ?? "—"}
                {destShort && (
                  <>
                    {" · "}
                    {airportCode} → {destShort}
                  </>
                )}
              </span>
              <span className="shrink-0 font-semibold text-foreground">{priceText}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Route className="h-4 w-4 text-primary" /> Зай
              </span>
              <span className="font-medium text-foreground">
                {summaryDistanceKm != null ? `~${summaryDistanceKm} км` : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" /> Хугацаа
              </span>
              <span className="font-medium text-foreground">
                {summaryDurationMin != null ? `~${summaryDurationMin} мин` : "—"}
              </span>
            </div>

            <div className="flex items-end justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-foreground">Нийт</span>
              <span className="font-display text-2xl font-black tracking-tight text-sky-500">{priceText}</span>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Only on the last step. Before that the summary is a running
                quote, not an order the traveler has been shown terms for. */}
            {step === 3 ? (
              <Button
                type="submit"
                size="lg"
                variant="reserve"
                className="hidden w-full md:inline-flex"
                disabled={submitting}
              >
                {submitting ? "Илгээж байна…" : "Төлж баталгаажуулах"}
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                variant="reserve"
                className="hidden w-full md:inline-flex"
                onClick={() => goToStep((step + 1) as BookingStep)}
              >
                Үргэлжлүүлэх
              </Button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-sky-500 hover:underline"
            >
              <MessageCircle className="h-4 w-4" /> Асуулт байна уу? WhatsApp-аар бичих →
            </a>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* ── Mobile sticky total + book bar (design doc, Screen 13) ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-card/95 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Нийт</p>
          <p className="truncate font-display text-xl font-black tracking-tight text-foreground">{priceText}</p>
          {/* Once a slot is chosen the bar echoes it, so the thing being paid
              for is visible from the button that pays for it. */}
          {step > 1 && datePart && shiftSlot && (
            <p className="truncate text-[11px] text-muted-foreground">
              {datePart.slice(5).replace("-", "/")} · {slotMeta(shiftSlot).label}
            </p>
          )}
        </div>
        {step === 3 ? (
          <Button
            type="submit"
            size="lg"
            variant="reserve"
            className="shrink-0 rounded-pill px-8"
            disabled={submitting}
          >
            {submitting ? "Илгээж байна…" : "Төлж баталгаажуулах"}
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            variant="reserve"
            className="shrink-0 rounded-pill px-8"
            onClick={() => goToStep((step + 1) as BookingStep)}
          >
            Үргэлжлүүлэх
          </Button>
        )}
      </div>
    </form>
  )
}

export function TransferBookingForm(props: TransferBookingFormProps) {
  return (
    <Suspense fallback={null}>
      <Form {...props} />
    </Suspense>
  )
}
