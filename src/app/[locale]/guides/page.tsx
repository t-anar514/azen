import { GuideFilter } from "@/components/guides/GuideFilter"
import { GuideCard } from "@/components/guides/GuideCard"
import guidesData from "@/data/guides.json"
import { useTranslations } from "next-intl"

export default function GuidesPage() {
  const t = useTranslations("Guides")

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold mb-4">{t("filters")}</h2>
            <GuideFilter />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-primary">{t("title")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("subtitle", { count: guidesData.length })}
            </p>
          </div>

          <div className="grid gap-6">
            {guidesData.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
