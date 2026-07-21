import { GuidesDirectory } from "@/components/guides/GuidesDirectory"
import { PageHeader } from "@/components/ui/page-header"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import type { GuideRow } from "@/lib/supabase/types"

async function getGuides(): Promise<GuideRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("guides")
    .select("*")
    .eq("is_active", true)
    .order("rating", { ascending: false })
  return data ?? []
}

export default async function GuidesPage() {
  const t = await getTranslations("Guides")
  const guides = await getGuides()

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-content mx-auto space-y-10">
        <PageHeader
          eyebrow="Хүнээс хүнд"
          title={t("title")}
          lead={t("subtitle", { count: guides.length })}
        />

        <GuidesDirectory guides={guides} />
      </div>
    </div>
  )
}
