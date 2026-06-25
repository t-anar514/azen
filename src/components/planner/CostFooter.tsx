import { useTranslations } from "next-intl"
import { SettingsModal, TripSettings } from "./SettingsModal"
import { ShareModal } from "./ShareModal"
import { Button } from "@/components/ui/button"

interface CostFooterProps {
  total: number
  onSave: () => void
  settings: TripSettings
  onSettingsUpdate: (settings: TripSettings) => void
  onExport: () => void
  tripId?: string | null
  isLoggedIn?: boolean
}

export function CostFooter({ total, onSave, settings, onSettingsUpdate, onExport, tripId = null, isLoggedIn = false }: CostFooterProps) {
  const t = useTranslations("Planner")

  // Currency Conversion (Static for now)
  // Locale pinned to "en-US" so the thousands-separator formatting can't differ between
  // the server's runtime locale and the browser's, which would otherwise risk a hydration
  // mismatch the same way unlocaled date formatting did in the shared planner view.
  const formatCost = (val: number) => {
    switch(settings.defaultCurrency) {
      case "MNT": return `₮ ${(val * 22).toLocaleString("en-US")}`
      case "USD": return `$ ${(val / 150).toFixed(2)}` // Random static rate for demo
      default: return `¥${val.toLocaleString("en-US")}`
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-3 md:p-4 z-40 md:pl-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="w-full flex flex-row items-center justify-between px-4 md:px-8 gap-2">
            
            <div className="flex items-center gap-1.5 md:gap-3">
                 <SettingsModal
                    settings={settings}
                    onSave={onSettingsUpdate}
                    onExport={onExport}
                 />
                 <ShareModal tripId={tripId} isLoggedIn={isLoggedIn} />
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
            </div>
        </div>
    </div>
  )
}
