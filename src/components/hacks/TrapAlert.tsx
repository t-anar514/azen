import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Hack } from "@/data/hacks"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"

export function TrapAlert({ hack }: { hack: Hack }) {
  const t = useTranslations("Hacks.trap")
  const tData = useTranslations("Data.Hacks")
  const isTrap = hack.category === "Tourist Trap"

  return (
    <Card className={`border-l-4 h-full flex flex-col ${isTrap ? "border-l-destructive" : "border-l-emerald-500"}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
            {isTrap ? <AlertTriangle className="text-destructive h-5 w-5 shrink-0" /> : <CheckCircle className="text-emerald-500 h-5 w-5 shrink-0" />}
            <CardTitle className="text-lg leading-tight">{tData(`${hack.id}.title`)}</CardTitle>
        </div>
        <CardDescription className="font-mono text-[10px] uppercase tracking-wider">{hack.category}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">{tData(`${hack.id}.summary`)}</p>
        
        {isTrap && hack.trapAlternative && (
            <div className="mt-4 p-3 bg-destructive/5 rounded-md text-xs border border-destructive/10">
                <span className="font-bold text-destructive">{t("alternative")} </span>
                {tData(`${hack.id}.trapAlternative`)}
            </div>
        )}
      </CardContent>
      <CardFooter>
          <Link href={`/hacks/${hack.id}` as any} className="w-full">
            <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-accent/10 hover:text-accent transition-colors">
              {t("readMore")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
      </CardFooter>
    </Card>
  )
}
