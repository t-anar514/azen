import { createClient } from "@/lib/supabase/server"
import { CityCard } from "@/components/essentials/CityCard"
import { PageHeader } from "@/components/ui/page-header"
import { getTranslations } from "next-intl/server"

async function getCities() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("cities")
    .select("*")
    .eq("published", true)
    .order("order_index", { ascending: true })
  return data ?? []
}

export default async function EssentialsPage() {
  const t = await getTranslations("Essentials")
  const cities = await getCities()

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <PageHeader
          eyebrow="Заавал мэдэх"
          title={t("title")}
          lead={t("description")}
        />

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        </section>
        
        <footer className="mt-20 pt-8 border-t border-secondary/20 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} {t("footer")}</p>
        </footer>
      </div>
    </div>
  )
}
