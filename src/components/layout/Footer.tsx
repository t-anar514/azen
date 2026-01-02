import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Instagram, Twitter, Facebook } from "lucide-react"
import NextImage from "next/image"
// Workaround for Next.js 16 + React 19 type mismatch
const Image = NextImage as any

export function Footer() {
  const t = useTranslations("Footer")
  const nt = useTranslations("Navigation")

  return (
    <footer className="w-full border-t border-secondary/20 bg-muted py-12">
      <div className="px-4 md:px-6 grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
           <div className="relative h-48 w-48 overflow-hidden">
                        <Image src="/logobg.png" alt="Azen Logo" fill className="object-cover" />
                     </div>
          </Link>
          <p className="text-sm text-foreground/80 leading-relaxed font-sans max-w-xs">
            {t("tagline")}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{t("platform")}</h3>
          <Link href="/guides" className="text-sm text-muted-foreground hover:underline">{nt("guides")}</Link>
          <Link href="/planner" className="text-sm text-muted-foreground hover:underline">{nt("planner")}</Link>
          <Link href="/hacks" className="text-sm text-muted-foreground hover:underline">{nt("hacks")}</Link>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{t("company")}</h3>
          <Link href="/about" className="text-sm text-muted-foreground hover:underline">{t("about")}</Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:underline">{nt("contact")}</Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">{t("privacy")}</Link>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{t("followUs")}</h3>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/azen.japan/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></a>
            <a href="https://www.facebook.com/profile.php?id=61585063457607/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></a>
            <a href="https://www.facebook.com/profile.php?id=61585063457607/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <div className=" mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Azen. {t("rights")}
      </div>
    </footer>
  )
}
