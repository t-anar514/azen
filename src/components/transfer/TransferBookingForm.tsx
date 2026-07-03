"use client"

import { Suspense, useEffect, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, MapPin, Route, Clock, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { RouteLine } from "@/components/ui/route-line"
import { RouteMap } from "@/components/transfer/RouteMap"
import { cn } from "@/lib/utils"
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

function formatPrice(price: number, currency: string) {
  return `${new Intl.NumberFormat("mn-MN").format(price)} ${currency}`
}

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
  const [passengers, setPassengers] = useState("")
  const [luggage, setLuggage] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoting, setQuoting] = useState(false)

  // Map: coordinates for the dropoff pin + the drawn driving route. Purely
  // illustrative — the price comes from the zone quote, never from these.
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
  // every time the destination or vehicle changes.
  useEffect(() => {
    if (!vehicleOptionId || zonesLoading) return
    let cancelled = false
    setQuoting(true)

    fetch("/api/transfer/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicle_option_id: vehicleOptionId, zone_id: zoneId }),
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
  }, [vehicleOptionId, zoneId, zonesLoading])

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
      passengers && `Зорчигч: ${passengers}`,
      luggage && `Ачаа: ${luggage}`,
      quote && `Тооцоолсон үнэ: ${formatPrice(quote.price, quote.currency)}`,
    ].filter(Boolean)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`
  })()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (isCustom && !customDropoff.trim()) {
      setError("Хүргэх газрын хаягаа бичнэ үү.")
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
          pickup_location: AIRPORT_NAMES[airportCode] ?? airportCode,
          dropoff_location: dropoffLocation,
          vehicle_option_id: vehicleOptionId,
          zone_id: zoneId,
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
    flightDirection === "arrival" ? "Авах газар (нисэх онгоцны буудал)" : "Хүргэх газар (нисэх онгоцны буудал)"
  const destFieldLabel =
    flightDirection === "arrival" ? "Хүргэх газар (буудал, хаяг)" : "Авах газар (буудал, хаяг)"

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl px-4 pb-20">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ─────────── LEFT: route + fare estimate ─────────── */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Маршрут ба үнийн тооцоо</h2>
                <RouteLine from={airportCode} to={destShort || undefined} className="mt-2" />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={flightDirection === "arrival" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFlightDirection("arrival")}
                >
                  Ирэх нислэг
                </Button>
                <Button
                  type="button"
                  variant={flightDirection === "departure" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFlightDirection("departure")}
                >
                  Явах нислэг
                </Button>
              </div>

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

                {isCustom && (
                  <div className="relative">
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
                    <p className="mt-1 text-xs text-muted-foreground">
                      Энэ хаяг манай тогтмол чиглэлийн жагсаалтад байхгүй тул эцсийн үнийг бид тантай холбогдож
                      баталгаажуулна. Доорх дүн ойролцоо тооцоо юм.
                    </p>
                  </div>
                )}
              </div>

              <RouteMap
                from={fromPoint}
                to={toPoint}
                routeGeometry={route?.geometry ?? null}
                onDestinationDragEnd={handleMarkerDrag}
              />

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {route ? (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <Route className="h-4 w-4 text-primary" /> {route.distanceKm} км
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" /> ~{route.durationMin} мин
                    </span>
                  </>
                ) : quote?.distanceKm != null ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Route className="h-4 w-4 text-primary" /> ~{quote.distanceKm} км
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-muted-foreground">
                Хэрэв зүү таны байршилд яг тохирохгүй бол улаан зүүг чирж тохируулна уу.
              </p>
            </CardContent>
          </Card>

          {/* vehicle picker + estimate */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <h2 className="font-display text-lg font-bold text-foreground">Тээврийн хэрэгсэл</h2>
              <div className="space-y-2">
                {vehicleOptions.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => setVehicleOptionId(vehicle.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border-2 p-4 text-left transition-colors",
                      vehicleOptionId === vehicle.id
                        ? "border-primary bg-secondary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{vehicle.name}</p>
                      {vehicle.description && <p className="text-sm text-muted-foreground">{vehicle.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary">
                        {vehicleOptionId === vehicle.id && quote
                          ? formatPrice(quote.price, quote.currency)
                          : `${formatPrice(vehicle.price, vehicle.currency)}-с`}
                      </span>
                      {vehicleOptionId === vehicle.id && <Check className="h-5 w-5 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-xl bg-secondary p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">Тооцоолсон үнэ</p>
                <p className="font-display text-3xl font-black tracking-tight text-foreground">
                  {quoting && !quote ? "…" : quote ? formatPrice(quote.price, quote.currency) : "—"}
                </p>
                {quote?.source === "vehicle_flat" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ойролцоо үнэ — эцсийн үнийг баталгаажуулна.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─────────── RIGHT: request details ─────────── */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="font-display text-lg font-bold text-foreground">Нислэгийн мэдээлэл</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="flight_number">Нислэгийн дугаар</Label>
                  <Input
                    id="flight_number"
                    placeholder="OM501"
                    required
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup_datetime">
                    {flightDirection === "arrival" ? "Буух огноо, цаг" : "Авах огноо, цаг"}
                  </Label>
                  <Input
                    id="pickup_datetime"
                    type="datetime-local"
                    required
                    value={pickupDatetime}
                    onChange={(e) => setPickupDatetime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passengers">Зорчигчийн тоо (заавал биш)</Label>
                  <Input
                    id="passengers"
                    placeholder="2"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="luggage">Ачаа (заавал биш)</Label>
                  <Input
                    id="luggage"
                    placeholder="3 чемодан"
                    value={luggage}
                    onChange={(e) => setLuggage(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="font-display text-lg font-bold text-foreground">Холбоо барих мэдээлэл</h2>
              <div className="space-y-2">
                <Label htmlFor="guest_name">Нэр</Label>
                <Input id="guest_name" required value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guest_email">Имэйл</Label>
                  <Input
                    id="guest_email"
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest_phone">Утасны дугаар</Label>
                  <Input
                    id="guest_phone"
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Нэмэлт тэмдэглэл (заавал биш)</Label>
                <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Нийт төлбөр</p>
                  <p className="font-display text-2xl font-black text-foreground">
                    {quoting && !quote ? "…" : quote ? formatPrice(quote.price, quote.currency) : "—"}
                  </p>
                </div>
                <Button type="submit" size="lg" variant="reserve" disabled={submitting}>
                  {submitting ? "Илгээж байна…" : "Захиалах"}
                </Button>
              </div>

              <div className="border-t border-border pt-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <MessageCircle className="h-4 w-4" /> Захиалахаас өмнө WhatsApp-аар асуух
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  Зорчигч, ачаа, тусгай хүсэлтээ урьдчилан тодруулах бол WhatsApp-аар бичээрэй. Захиалга заавал
                  энд хийгдэнэ.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
