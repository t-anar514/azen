import { ArrowRight, Compass, MapPin, Newspaper, Search } from "lucide-react"

import { Link } from "@/i18n/routing"

/**
 * Branded 404. Copy is hardcoded Mongolian rather than routed through
 * next-intl: this is a fallback surface, and a missing message key here would
 * turn a 404 into a 500. The site ships a single locale, so there is nothing
 * to translate away from.
 */
export const metadata = {
  title: "Хуудас олдсонгүй | Azen",
  // A soft-404 in search results is worse than none; keep this out of the index.
  robots: { index: false, follow: true },
}

const SUGGESTIONS = [
  {
    href: "/essentials" as const,
    icon: MapPin,
    title: "Хотууд",
    body: "Токио, Киото, Осака — хот бүрийн гарын авлага.",
  },
  {
    href: "/planner" as const,
    icon: Compass,
    title: "Аяллын төлөвлөгч",
    body: "Өдрөөр нь төлөвлөж, зардлаа тооцоол.",
  },
  {
    href: "/blog" as const,
    icon: Newspaper,
    title: "Блог",
    body: "Японд аялахад хэрэгтэй бодит зөвлөгөө.",
  },
]

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-content flex-col items-start px-4 py-20 md:px-8 md:py-28">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Алдаа 404
      </span>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
        Энэ хуудас олдсонгүй
      </h1>
      <p className="mt-4 max-w-prose text-lg text-muted-foreground">
        Хаяг буруу бичигдсэн эсвэл хуудас зөөгдсөн байж магадгүй. Доорхоос
        үргэлжлүүлээрэй.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-saffron-600"
        >
          Нүүр хуудас руу <ArrowRight className="size-4" strokeWidth={2.4} />
        </Link>
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <Search className="size-4" strokeWidth={2.2} /> Хөтөч хайх
        </Link>
      </div>

      <div className="mt-14 grid w-full gap-4 sm:grid-cols-3">
        {SUGGESTIONS.map(({ href, icon: Icon, title, body }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Icon className="size-5" strokeWidth={2.2} />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold text-foreground">{title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
