"use client"

import { Suspense, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { VehicleOptionRow, FlightDirection } from "@/lib/supabase/types"

interface TransferBookingFormProps {
  vehicleOptions: VehicleOptionRow[]
}

function formatPrice(price: number, currency: string) {
  return `${new Intl.NumberFormat("mn-MN").format(price)} ${currency}`
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
  const [pickupLocation, setPickupLocation] = useState(searchParams.get("pickup_location") ?? "")
  const [dropoffLocation, setDropoffLocation] = useState("")
  const [vehicleOptionId, setVehicleOptionId] = useState(vehicleOptions[0]?.id ?? "")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedVehicle = vehicleOptions.find((v) => v.id === vehicleOptionId)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

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
          pickup_location: pickupLocation,
          dropoff_location: dropoffLocation,
          vehicle_option_id: vehicleOptionId,
          notes: notes || undefined,
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

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 px-4 pb-20">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-bold text-[#1c315e]">Нислэгийн мэдээлэл</h2>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={flightDirection === "arrival" ? "default" : "outline"}
              className={flightDirection === "arrival" ? "bg-[#227c70] hover:bg-[#227c70]/90" : ""}
              onClick={() => setFlightDirection("arrival")}
            >
              Ирэх нислэг
            </Button>
            <Button
              type="button"
              variant={flightDirection === "departure" ? "default" : "outline"}
              className={flightDirection === "departure" ? "bg-[#227c70] hover:bg-[#227c70]/90" : ""}
              onClick={() => setFlightDirection("departure")}
            >
              Явах нислэг
            </Button>
          </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup_location">
              {flightDirection === "arrival" ? "Авах газар (нисэх онгоцны буудал)" : "Авах газар"}
            </Label>
            <Input
              id="pickup_location"
              placeholder="Narita International Airport (NRT)"
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropoff_location">
              {flightDirection === "arrival" ? "Хүргэх газар (буудал, хаяг)" : "Хүргэх газар (нисэх онгоцны буудал)"}
            </Label>
            <Input
              id="dropoff_location"
              placeholder="Hotel name / address"
              required
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="font-bold text-[#1c315e]">Тээврийн хэрэгсэл сонгох</h2>
          <div className="space-y-2">
            {vehicleOptions.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => setVehicleOptionId(vehicle.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border-2 p-4 text-left transition-colors",
                  vehicleOptionId === vehicle.id
                    ? "border-[#227c70] bg-[#227c70]/5"
                    : "border-gray-200 hover:border-[#227c70]/50"
                )}
              >
                <div>
                  <p className="font-semibold text-[#1c315e]">{vehicle.name}</p>
                  {vehicle.description && (
                    <p className="text-sm text-gray-500">{vehicle.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#227c70]">{formatPrice(vehicle.price, vehicle.currency)}</span>
                  {vehicleOptionId === vehicle.id && (
                    <Check className="h-5 w-5 text-[#227c70]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-bold text-[#1c315e]">Холбоо барих мэдээлэл</h2>
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

      <div className="flex items-center justify-between rounded-lg bg-[#1c315e] p-4 text-white">
        <div>
          <p className="text-sm opacity-80">Нийт төлбөр</p>
          <p className="text-2xl font-black">
            {selectedVehicle ? formatPrice(selectedVehicle.price, selectedVehicle.currency) : "—"}
          </p>
        </div>
        <Button type="submit" size="lg" disabled={submitting} className="bg-[#227c70] hover:bg-[#227c70]/90">
          {submitting ? "Илгээж байна…" : "Захиалах"}
        </Button>
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
