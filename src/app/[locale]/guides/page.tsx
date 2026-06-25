import { GuideFilter } from "@/components/guides/GuideFilter"
import { GuideCard } from "@/components/guides/GuideCard"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"

async function getGuides() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("guides")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
  return data ?? []
}

export default async function GuidesPage() {
  const t = await getTranslations("Guides")
  const guides = await getGuides()

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">
            {t("subtitle", { count: guides.length })}
          </p>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-primary">{t("filters")}</h2>
              <GuideFilter />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="grid gap-6">
              {guides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
