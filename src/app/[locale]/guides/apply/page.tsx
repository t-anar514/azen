import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/page-header"
import { GuideApplyForm } from "@/components/guides/GuideApplyForm"

export const metadata = {
  title: "Хөтөч болох | Azen",
}

export default async function GuideApplyPage() {
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
          eyebrow="Хөтөч болох"
          title="Мэддэг газраа хуваалцаж, орлого олоорой"
          lead="Японд амьдардаг, өөрийн хороололдоо дуртай хүмүүсийг хайж байна. Мэргэжлийн хөтөч байх шаардлагагүй."
        />
        <GuideApplyForm cities={cities ?? []} />
      </div>
    </div>
  )
}
