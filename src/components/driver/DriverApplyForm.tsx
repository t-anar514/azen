"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { DriverDocUploadField } from "@/components/driver/DriverDocUploadField"

interface DriverApplyFormProps {
  userId: string
}

export function DriverApplyForm({ userId }: DriverApplyFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [idDocumentUrl, setIdDocumentUrl] = useState("")
  const [licenseDocumentUrl, setLicenseDocumentUrl] = useState("")
  const [vehicleDocumentUrl, setVehicleDocumentUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Direct RLS-governed insert (drivers_insert_own policy requires
    // id = auth.uid()), same pattern the planner/itineraries pages use for
    // user-owned data — no dedicated API route needed.
    const supabase = createClient()
    const { error: insertError } = await supabase.from("drivers").insert({
      id: userId,
      full_name: fullName,
      phone,
      license_number: licenseNumber,
      vehicle_make: vehicleMake,
      vehicle_model: vehicleModel,
      vehicle_plate: vehiclePlate,
      id_document_url: idDocumentUrl || null,
      license_document_url: licenseDocumentUrl || null,
      vehicle_document_url: vehicleDocumentUrl || null,
    })

    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push("/driver/apply")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6 px-4 pb-16">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-bold text-foreground">Хувийн мэдээлэл</h2>
          <div className="space-y-2">
            <Label htmlFor="full_name">Бүтэн нэр</Label>
            <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Утасны дугаар</Label>
            <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="license_number">Жолооны үнэмлэхийн дугаар</Label>
            <Input
              id="license_number"
              required
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-bold text-foreground">Тээврийн хэрэгсэл</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vehicle_make">Үйлдвэрлэгч</Label>
              <Input id="vehicle_make" required value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_model">Модель</Label>
              <Input id="vehicle_model" required value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle_plate">Улсын дугаар</Label>
            <Input id="vehicle_plate" required value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-bold text-foreground">Бичиг баримт</h2>
          <DriverDocUploadField label="Иргэний үнэмлэх" docType="id" value={idDocumentUrl} onChange={setIdDocumentUrl} />
          <DriverDocUploadField
            label="Жолооны үнэмлэх"
            docType="license"
            value={licenseDocumentUrl}
            onChange={setLicenseDocumentUrl}
          />
          <DriverDocUploadField
            label="Тээврийн хэрэгслийн гэрчилгээ"
            docType="vehicle"
            value={vehicleDocumentUrl}
            onChange={setVehicleDocumentUrl}
          />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90" disabled={submitting}>
        {submitting ? "Илгээж байна…" : "Хүсэлт илгээх"}
      </Button>
    </form>
  )
}
