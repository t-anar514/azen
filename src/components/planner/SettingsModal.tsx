"use client"

import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Settings, Download, FileText, X, ChevronDown, Calendar as CalendarIcon } from "lucide-react"

export type Currency = "MNT" | "USD" | "JPY"

export interface TripSettings {
  simplifyExpenses: boolean
  defaultCurrency: Currency
  startDate: string
  endDate: string
}

interface SettingsModalProps {
  settings: TripSettings
  onSave: (settings: TripSettings) => void
  onExport: () => void
  trigger?: React.ReactNode
}

export function SettingsModal({ settings, onSave, onExport, trigger }: SettingsModalProps) {
  const t = useTranslations("Planner")
  const [open, setOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState<TripSettings>(settings)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = () => {
    onSave(localSettings)
    setOpen(false)
  }

  const currencies = [
    { code: "MNT", label: "Mongolian Tugrug", flag: "🇲🇳" },
    { code: "USD", label: "US Dollar", flag: "🇺🇸" },
    { code: "JPY", label: "Japanese Yen", flag: "🇯🇵" }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[420px] bg-[#f8f7f0] border-none rounded-[24px] md:rounded-[32px] overflow-hidden p-0 shadow-2xl">
        <DialogHeader className="p-4 md:p-6 pb-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl md:text-2xl font-bold text-[#1a1a1a]">{t("expenseSettings")}</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Group Expenses Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-lg font-bold text-[#1a1a1a]">{t("simplifyExpenses")}</Label>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("simplifyExpensesDesc")}
              </p>
            </div>
            <button 
              onClick={() => setLocalSettings({ ...localSettings, simplifyExpenses: !localSettings.simplifyExpenses })}
              className={`shrink-0 w-12 h-6 rounded-full transition-colors relative ${localSettings.simplifyExpenses ? 'bg-accent' : 'bg-muted'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${localSettings.simplifyExpenses ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* Currency Selector */}
          <div className="space-y-3">
            <Label className="text-lg font-bold text-[#1a1a1a]">{t("defaultCurrency")}</Label>
            <div className="relative">
              <select
                value={localSettings.defaultCurrency}
                onChange={(e) => setLocalSettings({ ...localSettings, defaultCurrency: e.target.value as Currency })}
                className="w-full bg-white border border-muted-foreground/20 rounded-2xl p-4 pl-12 appearance-none focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                {currencies.find(c => c.code === localSettings.defaultCurrency)?.flag}
              </div>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Date Pickers */}
          <div className="space-y-3">
            <Label className="text-lg font-bold text-[#1a1a1a]">{t("tripDates")}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("startDate")}</span>
                <div className="relative">
                  <Input 
                    type="date" 
                    value={localSettings.startDate}
                    onChange={(e) => setLocalSettings({ ...localSettings, startDate: e.target.value })}
                    className="h-12 rounded-xl border-muted-foreground/20 bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("endDate")}</span>
                <div className="relative">
                  <Input 
                    type="date" 
                    value={localSettings.endDate}
                    onChange={(e) => setLocalSettings({ ...localSettings, endDate: e.target.value })}
                    className="h-12 rounded-xl border-muted-foreground/20 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Export */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-muted-foreground/10 group hover:border-accent/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <Label className="font-bold text-[#1a1a1a] leading-none">{t("exportCSV")}</Label>
                <p className="text-xs text-muted-foreground">{t("exportCSVDesc")}</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onExport}
              className="rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white border-none"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("export")}
            </Button>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <Button variant="ghost" className="flex-1 rounded-full text-muted-foreground" onClick={() => setOpen(false)}>
            {t("item.cancel")}
          </Button>
          <Button className="flex-1 rounded-full bg-[#1a1a1a] hover:bg-[#333] text-white" onClick={handleSave}>
            {t("item.done")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
