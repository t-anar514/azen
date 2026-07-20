import { Clock } from "lucide-react"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Section } from "@/components/ui/section"

const MOCK_STOPS = [
  { title: "Sensō-ji Temple", note: "Asakusa · өглөө эрт", minutes: 90 },
  { title: "Tsukiji Outer Market", note: "Tsukiji · өглөөний хоол", minutes: 75 },
  { title: "teamLab Planets", note: "Toyosu · урьдчилан захиалах", minutes: 120 },
  { title: "Golden Gai", note: "Shinjuku · шөнө", minutes: 90 },
]

// Copy left, itinerary mockup right — the wizard's shop window.
export function CustomTourSplit() {
  return (
    <Section tint="muted">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Eyebrow>Захиалгат аялал</Eyebrow>
          <h2 className="mt-2 text-section text-foreground">
            Бэлэн хөтөлбөр биш.{" "}
            <span className="italic text-primary">Таны хөтөлбөр.</span>
          </h2>
          <p className="mt-4 text-lead">
            Дөрвөн асуулт. Хэмнэл, сонирхол, төсвөө хэлээд өөрт тохирсон өдрийн төлөвлөгөө аваарай —
            нутгийн баталгаажсан хөтөч хянаж баталгаажуулна.
          </p>
          <Button asChild variant="reserve" className="mt-8 rounded-pill">
            <Link href="/tours/custom">Миний аялал зохиох</Link>
          </Button>
        </div>

        {/* itinerary mockup */}
        <div className="rounded-card border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <p className="text-eyebrow">Жишээ төлөвлөгөө</p>
            <p className="font-display text-lg font-bold text-foreground">Токио · 1 өдөр</p>
          </div>
          <ol className="divide-y divide-border">
            {MOCK_STOPS.map((stop, i) => (
              <li key={stop.title} className="flex items-center gap-4 px-5 py-3.5">
                <span className="w-5 shrink-0 text-center font-display text-base font-extrabold text-primary/30">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {stop.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{stop.note}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> {stop.minutes}м
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  )
}
