import { useTranslations } from "next-intl"
import { Share2, Wallet } from "lucide-react"
import { TripSettings } from "./SettingsModal"
import { ShareModal } from "./ShareModal"
import { BalancesModal } from "./BalancesModal"
import { Button } from "@/components/ui/button"
import { formatCurrency, FALLBACK_RATES, Rates } from "@/lib/currency/format"
import type { ItemType } from "./Timeline"
import type { TripParticipant, CostSplit } from "@/lib/budget/splitBalances"

interface CostFooterProps {
  total: number
  onSave: () => void
  settings: TripSettings
  tripId?: string | null
  isLoggedIn?: boolean
  isOwner?: boolean
  rates?: Rates
  ratesFetchedAt?: string | null
  items?: ItemType[]
  participants?: TripParticipant[]
  splits?: Map<string, CostSplit>
}

// Bottom action bar (design doc Screen 03): "Хуваалцах",
// "Тооцоо (хэн хэнд)", the navy save button, and the running total on the right.
export function CostFooter({ total, onSave, settings, tripId = null, isLoggedIn = false, isOwner = true, rates = FALLBACK_RATES, ratesFetchedAt = null, items = [], participants = [], splits = new Map() }: CostFooterProps) {
  const t = useTranslations("Planner")

  const formatCost = (val: number) => formatCurrency(val, settings.defaultCurrency, rates)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur-sm md:p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {/* ── Mobile bar (design doc, Screen 13): total left · action right ── */}
        <div className="flex items-center justify-between gap-3 px-1 md:hidden">
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("estimatedCost")}</p>
                <p className="truncate font-display text-xl font-black tracking-tight text-primary">
                    {formatCost(total)}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <ShareModal
                    tripId={tripId}
                    isLoggedIn={isLoggedIn}
                    isOwner={isOwner}
                    trigger={
                      <Button variant="outline" size="icon" className="size-9 rounded-full" aria-label="Хуваалцах">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    }
                />
                <BalancesModal
                    items={items}
                    participants={participants}
                    splits={splits}
                    currency={settings.defaultCurrency}
                    rates={rates}
                    trigger={
                      <Button variant="outline" size="icon" className="size-9 rounded-full" aria-label="Тооцоо">
                        <Wallet className="h-4 w-4" />
                      </Button>
                    }
                />
                <Button
                  onClick={onSave}
                  className="rounded-pill h-9 bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                >
                    Хадгалах
                </Button>
            </div>
        </div>

        {/* ── Desktop bar (design doc, Screen 03) ── */}
        <div className="hidden w-full flex-row items-center justify-between gap-2 px-3 md:flex md:px-6">

            <div className="flex items-center gap-1.5 md:gap-2">
                 <ShareModal
                    tripId={tripId}
                    isLoggedIn={isLoggedIn}
                    isOwner={isOwner}
                    trigger={
                      <Button variant="outline" className="rounded-pill h-9 gap-1.5 px-3 text-xs font-semibold md:px-4 md:text-sm">
                        <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Хуваалцах</span>
                      </Button>
                    }
                 />
                 <BalancesModal
                    items={items}
                    participants={participants}
                    splits={splits}
                    currency={settings.defaultCurrency}
                    rates={rates}
                    trigger={
                      <Button variant="outline" className="rounded-pill h-9 gap-1.5 px-3 text-xs font-semibold md:px-4 md:text-sm">
                        <Wallet className="h-4 w-4" /> <span className="hidden sm:inline">Тооцоо (хэн хэнд)</span>
                        <span className="sm:hidden">Тооцоо</span>
                      </Button>
                    }
                 />
                 <Button
                  onClick={onSave}
                  className="rounded-pill h-9 px-3 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 md:px-5 md:text-sm"
                  style={{ background: "#0C1826" }}
                 >
                    {t("saveItinerary")}
                 </Button>
            </div>

            <div className="min-w-0 text-right">
                <p className="truncate text-[8px] font-black uppercase tracking-widest text-muted-foreground md:text-[10px]">{t("estimatedCost")}</p>
                <p className="truncate font-display text-lg font-black tracking-tight md:text-2xl" style={{ color: "#0C1826" }}>
                    {formatCost(total)}
                </p>
                {settings.defaultCurrency !== "JPY" && ratesFetchedAt && (
                  <p className="truncate text-[8px] text-muted-foreground md:text-[9px]">
                    {t("ratesAsOf", { date: ratesFetchedAt.slice(0, 10) })}
                  </p>
                )}
            </div>
        </div>
    </div>
  )
}
