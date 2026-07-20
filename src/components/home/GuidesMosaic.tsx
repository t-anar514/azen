import { BadgeCheck, Languages, MapPinned, MessagesSquare } from "lucide-react"

import { Eyebrow } from "@/components/ui/eyebrow"
import { Section } from "@/components/ui/section"
import { IconList } from "@/components/ui/icon-list"
import { ImageMosaic } from "@/components/ui/image-mosaic"
import { InlineCtaBanner } from "@/components/ui/inline-cta-banner"
import type { GuideRow } from "@/lib/supabase/types"

const POINTS = [
  {
    icon: BadgeCheck,
    title: "Баталгаажсан хүмүүс",
    description: "Бид бүртгэл, лиценз, сэтгэгдлийг нь шалгасны дараа л жагсаалтад оруулна.",
  },
  {
    icon: MapPinned,
    title: "Тэнд амьдардаг",
    description: "Мэргэжлийн хөтөч биш — тухайн хороололд өдөр бүр алхдаг хүмүүс.",
  },
  {
    icon: Languages,
    title: "Монголоор ярина",
    description: "Хэлний саадгүй — асуултаа шууд асууж, шууд хариулт аваарай.",
  },
  {
    icon: MessagesSquare,
    title: "Өөрсдийн үгээр",
    description: "Санал болгосон газар бүр нь нэр бүхий хөтчийн иш татсан сэтгэгдэлтэй.",
  },
]

export function GuidesMosaic({ guides }: { guides: GuideRow[] }) {
  const images = guides
    .filter((g) => g.image)
    .slice(0, 4)
    .map((g) => ({ src: g.image as string, alt: g.name }))

  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {images.length > 0 && <ImageMosaic images={images} className="order-last lg:order-first" />}
        <div>
          <Eyebrow>Манай хөтчүүд</Eyebrow>
          <h2 className="mt-2 text-section text-foreground">
            Жуулчны хөтөч биш.{" "}
            <span className="italic text-primary">Нутгийн хүн.</span>
          </h2>
          <IconList items={POINTS} className="mt-8" />
        </div>
      </div>

      <InlineCtaBanner
        className="mt-16"
        tint="saffron"
        title="Та Японд амьдардаг уу?"
        description="Хөтөч болж, өөрийн мэддэг газруудаа хуваалцаад орлого олоорой."
        ctaLabel="Хөтөч болох"
        href="/guides/apply"
      />
    </Section>
  )
}
