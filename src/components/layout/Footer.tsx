import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Instagram, Facebook } from "lucide-react"
import NextImage from "next/image"
const Image = NextImage as any

export function Footer() {
  const t  = useTranslations("Footer")
  const nt = useTranslations("Navigation")

  return (
    <footer className="w-full border-t border-border bg-muted/50 py-12">
      <div className="px-4 md:px-8 grid grid-cols-2 gap-8 md:grid-cols-4">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl">
              <Image src="/logobg.png" alt="Azen Logo" fill className="object-cover" />
            </div>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            {t("tagline")}
          </p>
          <div className="flex gap-3 mt-1">
            <a href="https://www.instagram.com/azen.japan/" target="_blank" rel="noopener noreferrer"
               className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61585063457607/" target="_blank" rel="noopener noreferrer"
               className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Platform — booking & planning */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
            {t("platform")}
          </h3>
          <Link href="/transfer"  className="text-sm text-foreground/80 hover:text-primary transition-colors">{nt("transfer")}</Link>
          <Link href="/guides"    className="text-sm text-foreground/80 hover:text-primary transition-colors">{nt("guides")}</Link>
          <Link href="/planner"   className="text-sm text-foreground/80 hover:text-primary transition-colors">{nt("planner")}</Link>
          <Link href="/flights"   className="text-sm text-foreground/80 hover:text-primary transition-colors">{nt("flights")}</Link>
        </div>

        {/* Discover — content / learning */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
            Мэдлэг
          </h3>
          <Link href="/blog"       className="text-sm text-foreground/80 hover:text-primary transition-colors">{nt("blog")}</Link>
          <Link href="/essentials" className="text-sm text-foreground/80 hover:text-primary transition-colors">{nt("essentials")}</Link>
          <Link href="/learn"      className="text-sm text-foreground/80 hover:text-primary transition-colors">{nt("learn")}</Link>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
            {t("company")}
          </h3>
          <Link href="/about"   className="text-sm text-foreground/80 hover:text-primary transition-colors">{t("about")}</Link>
          <Link href="/contact" className="text-sm text-foreground/80 hover:text-primary transition-colors">{nt("contact")}</Link>
          <Link href="/privacy" className="text-sm text-foreground/80 hover:text-primary transition-colors">{t("privacy")}</Link>
        </div>

      </div>

      <div className="mt-10 border-t border-border pt-6 px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Azen. {t("rights")}</span>
        <span className="inline-flex items-center gap-1">🇲🇳 Монголоор хийсэн</span>
      </div>
    </footer>
  )
}
