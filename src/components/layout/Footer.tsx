import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Instagram, Facebook } from "lucide-react"
import NextImage from "next/image"
const Image = NextImage as any

export function Footer() {
  const t  = useTranslations("Footer")
  const nt = useTranslations("Navigation")

  return (
    <footer className="w-full text-white" style={{ background: "#0C1826" }}>
      <div className="mx-auto max-w-content px-4 md:px-8 pt-14 grid grid-cols-2 gap-8 md:grid-cols-4">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl">
              <Image src="/logobg.png" alt="Azen Logo" fill className="object-cover" />
            </div>
          </Link>
          <p className="text-sm leading-relaxed max-w-xs text-white/60">
            {t("tagline")}
          </p>
          <div className="flex gap-2.5 mt-1">
            <a href="https://www.instagram.com/azen.japan/" target="_blank" rel="noopener noreferrer"
               className="flex size-[34px] items-center justify-center rounded-full bg-white/[.08] text-white hover:bg-white/15 transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61585063457607/" target="_blank" rel="noopener noreferrer"
               className="flex size-[34px] items-center justify-center rounded-full bg-white/[.08] text-white hover:bg-white/15 transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Platform — booking & planning */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/45 mb-1.5">
            {t("platform")}
          </h3>
          <Link href="/planner"      className="text-[13.5px] text-white/75 hover:text-white transition-colors">{nt("planner")}</Link>
          <Link href="/guides"       className="text-[13.5px] text-white/75 hover:text-white transition-colors">{nt("guides")}</Link>
          <Link href="/tours/custom" className="text-[13.5px] text-white/75 hover:text-white transition-colors">Захиалгат аялал</Link>
          <Link href="/flights"      className="text-[13.5px] text-white/75 hover:text-white transition-colors">{nt("flights")}</Link>
          <Link href="/transfer"     className="text-[13.5px] text-white/75 hover:text-white transition-colors">{nt("transfer")}</Link>
        </div>

        {/* Discover — content / learning */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/45 mb-1.5">
            Мэдлэг
          </h3>
          <Link href="/essentials" className="text-[13.5px] text-white/75 hover:text-white transition-colors">{nt("essentials")}</Link>
          <Link href="/blog"       className="text-[13.5px] text-white/75 hover:text-white transition-colors">{nt("blog")}</Link>
          <Link href="/learn"      className="text-[13.5px] text-white/75 hover:text-white transition-colors">{nt("learn")}</Link>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/45 mb-1.5">
            {t("company")}
          </h3>
          <Link href="/about"        className="text-[13.5px] text-white/75 hover:text-white transition-colors">{t("about")}</Link>
          <Link href="/contact"      className="text-[13.5px] text-white/75 hover:text-white transition-colors">{nt("contact")}</Link>
          <Link href="/guides/apply" className="text-[13.5px] text-white/75 hover:text-white transition-colors">Хөтөч болох</Link>
          <Link href="/driver/apply" className="text-[13.5px] text-white/75 hover:text-white transition-colors">Жолооч болох</Link>
          <Link href="/privacy"      className="text-[13.5px] text-white/75 hover:text-white transition-colors">{t("privacy")}</Link>
        </div>

      </div>

      <div className="mx-auto max-w-content mt-9 border-t border-white/10 pt-[22px] pb-8 px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12.5px] text-white/50">
        <span>© {new Date().getFullYear()} Azen. {t("rights")}</span>
        <span className="inline-flex items-center gap-1">🇲🇳 Монголоор хийсэн</span>
      </div>
    </footer>
  )
}
