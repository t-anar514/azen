import { Eyebrow } from "@/components/ui/eyebrow"
import { Section } from "@/components/ui/section"
import { ProcessRow } from "@/components/ui/process-row"

const STEPS = [
  { title: "Таны сонголт", description: "Хэмнэл, сонирхол, төсвөө хэлнэ. Дөрвөн асуулт, бүртгэлгүй." },
  { title: "Бид бүтээнэ", description: "Нутгийн хөтчүүдийн санал болгосон газруудаас өдрийн төлөвлөгөө угсарна." },
  { title: "Та амсана", description: "Хөтөч, тээвэр, төсвийн хуваалт — бүгд нэг дороо." },
]

export function HowItWorks() {
  return (
    <Section>
      <div className="max-w-xl">
        <Eyebrow>Хэрхэн ажилладаг вэ</Eyebrow>
        <h2 className="mt-2 text-section text-foreground">Гурван алхам</h2>
      </div>
      <ProcessRow steps={STEPS} className="mt-12" />
    </Section>
  )
}
