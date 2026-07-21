import { getActiveFlightDeals } from "@/lib/flights/provider"
import { FlightsDirectory } from "@/components/flights/FlightsDirectory"
import { PageHeader } from "@/components/ui/page-header"

export const metadata = {
  title: "Хямд нислэг Японд | Azen",
  description: "Япон руу хямд нислэгийн саналуудыг харьцуулж, Хүргэх/Тосохээ нэг дор захиалаарай.",
}

export default async function FlightsPage() {
  const deals = await getActiveFlightDeals()

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="mx-auto max-w-content space-y-10">
        <PageHeader
          eyebrow="Улаанбаатараас"
          title="Хямд нислэгийн санал"
          lead="Тийзээ нислэгийн компани эсвэл агентын сайтаас шууд аваад, буух буудлаасаа хүргэлтээ нэг товчоор нэмээрэй."
        />

        {deals.length === 0 ? (
          <p className="rounded-card border border-dashed border-border p-12 text-center text-muted-foreground">
            Одоогоор санал алга байна. Удахгүй шинэ саналууд нэмэгдэх болно.
          </p>
        ) : (
          <FlightsDirectory deals={deals} />
        )}
      </div>
    </div>
  )
}
