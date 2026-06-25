import { Car } from "lucide-react"
import { getActiveVehicleOptions } from "@/lib/transfers/options"
import { TransferBookingForm } from "@/components/transfer/TransferBookingForm"

export const metadata = {
  title: "Аэропортын хүргэлт захиалах | Azen",
  description: "Японд буух эсвэл явах нислэгтэй холбоотой аэропортын хүргэлтээ тогтмол үнээр захиалаарай.",
}

export default async function TransferPage() {
  const vehicleOptions = await getActiveVehicleOptions()

  return (
    <div className="min-h-screen bg-[#e6e2c3] pb-10">
      <section className="px-4 pt-16 pb-8 text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-[#227c70]/10 px-4 py-1.5 text-sm font-semibold text-[#227c70]">
          <Car className="h-4 w-4" /> Аэропортын хүргэлт
        </div>
        <h1 className="mt-4 text-4xl font-black text-[#1c315e] md:text-5xl">Хүргэлтээ захиалаарай</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Тогтмол үнэ, нэмэлт төлбөргүй. Нислэгийн дугаараа өгөхөд бид таны буух цагт тохируулна.
        </p>
      </section>

      <TransferBookingForm vehicleOptions={vehicleOptions} />
    </div>
  )
}
