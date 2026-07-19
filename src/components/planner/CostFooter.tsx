import { useTranslations } from "next-intl"
import { SettingsModal, TripSettings } from "./SettingsModal"
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
  onSettingsUpdate: (settings: TripSettings) => void
  onExport: () => void
  tripId?: string | null
  isLoggedIn?: boolean
  isOwner?: boolean
  rates?: Rates
  ratesFetchedAt?: string | null
  items?: ItemType[]
  participants?: TripParticipant[]
  splits?: Map<string, CostSplit>
}

export function CostFooter({ total, onSave, settings, onSettingsUpdate, onExport, tripId = null, isLoggedIn = false, isOwner = true, rates = FALLBACK_RATES, ratesFetchedAt = null, items = [], participants = [], splits = new Map() }: CostFooterProps) {
  const t = useTranslations("Planner")

  const formatCost = (val: number) => formatCurrency(val, settings.defaultCurrency, rates)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-3 md:p-4 z-40 md:pl-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="w-full flex flex-row items-center justify-between px-4 md:px-8 gap-2">
            
            <div className="flex items-center gap-1.5 md:gap-3">
                 <SettingsModal
                    settings={settings}
                    onSave={onSettingsUpdate}
                    onExport={onExport}
                 />
                 <ShareModal tripId={tripId} isLoggedIn={isLoggedIn} isOwner={isOwner} />
                 <BalancesModal
                    items={items}
                    participants={participants}
                    splits={splits}
                    currency={settings.defaultCurrency}
                    rates={rates}
                 />
                 <Button
                  onClick={onSave}
                  className="bg-primary text-primary-foreground px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95"
                 >
                    {t("saveItinerary")}
                 </Button>
            </div>
            <div className="text-right min-w-0">
                <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest truncate">{t("estimatedCost")}</p>
                <p className="text-lg md:text-2xl font-black font-mono tracking-tighter text-primary truncate">
                    {formatCost(total)}
                </p>
                {settings.defaultCurrency !== "JPY" && ratesFetchedAt && (
                  <p className="text-[8px] md:text-[9px] text-muted-foreground truncate">
                    {t("ratesAsOf", { date: ratesFetchedAt.slice(0, 10) })}
                  </p>
                )}
            </div>
        </div>
    </div>
  )
}
