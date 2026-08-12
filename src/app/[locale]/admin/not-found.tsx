import Link from "next/link"
import { ArrowLeft, FileQuestion } from "lucide-react"

/**
 * Admin-scoped 404.
 *
 * Without this, `notFound()` from an admin edit page (a record id that no
 * longer resolves) bubbles up to `[locale]/not-found.tsx` — the public 404,
 * which renders *outside* `admin/layout.tsx` and so loses the sidebar, while
 * `HideOnAdmin` separately suppresses the public navbar on /admin routes. An
 * admin ended up on a chrome-less consumer page suggesting they go read the
 * blog.
 *
 * Next resolves `notFound()` to the nearest not-found boundary, so placing one
 * here keeps admin 404s inside the admin shell with admin-appropriate copy.
 */
export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center">
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <FileQuestion className="size-5" strokeWidth={2.2} />
      </span>

      <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
        Ийм бичлэг олдсонгүй
      </h1>
      <p className="mt-2.5 max-w-prose text-muted-foreground">
        Энэ бичлэг устгагдсан эсвэл хаяг нь буруу байж магадгүй. Жагсаалт руу
        буцаж шалгана уу.
      </p>

      <Link
        href="/admin"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <ArrowLeft className="size-4" strokeWidth={2.4} /> Хянах самбар руу
      </Link>
    </div>
  )
}
