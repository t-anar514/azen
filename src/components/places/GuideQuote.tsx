import { CheckCircle2 } from "lucide-react"
import NextImage from "next/image"
import { Link } from "@/i18n/routing"

const Image = NextImage as any

interface GuideQuoteProps {
  guide: { id: string; name: string; image: string | null }
  quote: string
  compact?: boolean
}

// The trust device: a named, verified guide vouching in their own words.
export function GuideQuote({ guide, quote, compact = false }: GuideQuoteProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 border-t border-border pt-3 mt-auto">
        <GuideAvatar guide={guide} size="h-6 w-6" />
        <p className="text-xs text-muted-foreground truncate">
          <span className="font-semibold text-foreground">{guide.name}</span> санал болгож байна
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-card bg-tint-sky/50 p-5 space-y-3">
      <div className="flex items-center gap-3">
        <GuideAvatar guide={guide} size="h-11 w-11" />
        <div>
          <p className="font-display font-bold text-foreground leading-tight">{guide.name}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-success" /> Баталгаажсан хөтөч
          </p>
        </div>
      </div>
      <p className="text-sm italic leading-relaxed text-foreground/90">“{quote}”</p>
      <Link href="/guides" className="inline-block text-sm font-semibold text-primary hover:underline underline-offset-4">
        Хөтөчийн профайл үзэх →
      </Link>
    </div>
  )
}

function GuideAvatar({ guide, size }: { guide: GuideQuoteProps["guide"]; size: string }) {
  return (
    <div className={`relative ${size} shrink-0 overflow-hidden rounded-full bg-muted`}>
      {guide.image ? (
        <Image src={guide.image} alt={guide.name} fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary/40">
          {guide.name[0]}
        </div>
      )}
    </div>
  )
}
