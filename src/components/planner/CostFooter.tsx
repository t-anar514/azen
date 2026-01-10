import { useTranslations } from "next-intl"
import { SettingsModal, TripSettings } from "./SettingsModal"
import { Button } from "@/components/ui/button"

interface CostFooterProps {
  total: number
  onSave: () => void
  settings: TripSettings
  onSettingsUpdate: (settings: TripSettings) => void
  onExport: () => void
}

export function CostFooter({ total, onSave, settings, onSettingsUpdate, onExport }: CostFooterProps) {
  const t = useTranslations("Planner")

  // Currency Conversion (Static for now)
  const formatCost = (val: number) => {
    switch(settings.defaultCurrency) {
      case "MNT": return `₮ ${(val * 22).toLocaleString()}`
      case "USD": return `$ ${(val / 150).toFixed(2)}` // Random static rate for demo
      default: return `¥${val.toLocaleString()}`
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-40 md:pl-0">
        <div className="container flex justify-between items-center max-w-5xl mx-auto px-4">
            
            <div className="flex items-center gap-2">
                 <SettingsModal 
                    settings={settings} 
                    onSave={onSettingsUpdate} 
                    onExport={onExport} 
                 />
                 <Button 
                  onClick={onSave}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors"
                 >
                    {t("saveItinerary")}
                 </Button>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t("estimatedCost")}</p>
                <p className="text-2xl font-black font-mono tracking-tighter text-primary">
                    {formatCost(total)}
                </p>
            </div>
        </div>
    </div>
  )
}
