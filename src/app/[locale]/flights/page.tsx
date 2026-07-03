import { Plane } from "lucide-react"
import { getActiveFlightDeals } from "@/lib/flights/provider"
import { FlightDealCard } from "@/components/flights/FlightDealCard"

export const metadata = {
  title: "Хямд нислэг Японд | Azen",
  description: "Япон руу хямд нислэгийн саналуудыг харьцуулж, Хүргэх/Тосохээ нэг дор захиалаарай.",
}

export default async function FlightsPage() {
  const deals = await getActiveFlightDeals()

  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="px-4 pt-16 pb-10 text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <Plane className="h-4 w-4" /> Хямд нислэгийн саналууд
        </div>
        <h1 className="mt-4 text-4xl font-black text-foreground md:text-5xl">Японд хямд нисье</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Бид олсон хамгийн сайн нислэгийн саналуудыг доор жагсаав. Тийзээ нислэгийн компани эсвэл агентын
          сайт дээр шууд авна, дараа нь буух нисэх онгоцны буудлаасаа хүргэлтээ нэг товчоор захиалаарай.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 sm:grid-cols-2">
        {deals.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            Одоогоор санал алга байна. Удахгүй шинэ саналууд нэмэгдэх болно.
          </p>
        ) : (
          deals.map((deal) => <FlightDealCard key={deal.id} deal={deal} />)
        )}
      </section>
    </div>
  )
}
