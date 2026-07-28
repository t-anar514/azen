import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/page-header"
import { TourWizard } from "@/components/tours/TourWizard"

export default async function CustomTourPage() {
  const supabase = await createClient()
  const { data: cities } = await supabase
    .from("cities")
    .select("id, name")
    .eq("published", true)
    .order("order_index")

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="mx-auto max-w-content space-y-12">
        <PageHeader
          eyebrow="Захиалгат аялал"
          title="Танд зориулсан өдрийн төлөвлөгөө"
          lead="Дөрвөн асуултад хариулаад, Хөтөчөөр баталгаажсан төлөвлөгөө аваарай. Бүртгүүлэх шаардлагагүй."
        />
        <TourWizard cities={cities ?? []} />
      </div>
    </div>
  )
}
