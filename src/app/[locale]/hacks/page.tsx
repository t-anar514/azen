import { TrapAlert } from "@/components/hacks/TrapAlert"
import { HACKS } from "@/data/hacks"
import { useTranslations } from "next-intl"

export default function HacksPage() {
  const t = useTranslations("Hacks")

  return (
    <div className=" py-8 px-4 md:px-6">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-black tracking-tight text-primary mb-4 uppercase italic">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {HACKS.map((hack) => (
          <TrapAlert key={hack.id} hack={hack} />
        ))}
      </div>
    </div>
  )
}
