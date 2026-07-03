import { TrapAlert } from "@/components/hacks/TrapAlert"
import { PageHeader } from "@/components/ui/page-header"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"

async function getHacks() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("hacks")
    .select("*")
    .eq("published", true)
    .order("order_index", { ascending: true })
  return data ?? []
}

export default async function HacksPage() {
  const t = await getTranslations("Hacks")
  const hacks = await getHacks()

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <PageHeader
          eyebrow="Аяллын заавар"
          title={t("title")}
          lead={t("description")}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hacks.map((hack) => (
            <TrapAlert key={hack.id} hack={hack} />
          ))}
        </div>
      </div>
    </div>
  )
}
