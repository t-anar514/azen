"use client"

import { useState } from "react"
import { Experience } from "@/data/experiences"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Minus, Plus, Users } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function BookingCard({ experience }: { experience: Experience }) {
  const [date, setDate] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const t = useTranslations("ExperienceDetail")

  const totalPrice = experience.basePrice * guests

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-[#1c315e]/5 space-y-6">
      <div className="flex items-baseline justify-between">
        <span className="text-[#1c315e]/60 font-bold uppercase tracking-widest text-[10px]">{t('pricePerPerson')}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-[#1c315e]">¥{experience.basePrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Date Picker */}
        <div className="space-y-2">
           <label className="text-[10px] font-black text-[#1c315e]/60 uppercase tracking-widest ml-1">{t('selectDate')}</label>
           <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-bold border-2 border-[#1c315e]/10 h-14 rounded-2xl bg-[#e6e2c3]/20 hover:bg-[#e6e2c3]/30 transition-all",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-5 w-5 text-[#227c70]" />
                {date ? format(date, "PPP") : <span>{t('chooseDate')}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="bg-white"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guest Selector */}
        <div className="space-y-2">
            <label className="text-[10px] font-black text-[#1c315e]/60 uppercase tracking-widest ml-1">{t('numberOfGuests')}</label>
            <div className="flex items-center justify-between border-2 border-[#1c315e]/10 h-14 rounded-2xl px-4 bg-[#e6e2c3]/20">
                <div className="flex items-center gap-3 font-bold text-[#1c315e]">
                    <Users className="w-5 h-5 text-[#227c70]" />
                    <span>{guests} {guests === 1 ? t('guest') : t('guests')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        disabled={guests <= 1}
                        className="w-8 h-8 rounded-full border border-[#1c315e]/20 flex items-center justify-center hover:bg-white disabled:opacity-30 transition-all"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setGuests(Math.min(experience.maxGroupSize, guests + 1))}
                        disabled={guests >= experience.maxGroupSize}
                        className="w-8 h-8 rounded-full border border-[#1c315e]/20 flex items-center justify-center hover:bg-white disabled:opacity-30 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-[#1c315e]/10 pt-6 space-y-4">
        <div className="flex justify-between items-center">
            <span className="text-[#1c315e] font-black uppercase tracking-widest text-[11px]">{t('totalEstimate')}</span>
            <span className="text-3xl font-black text-[#1c315e]">¥{totalPrice.toLocaleString()}</span>
        </div>
        <Button className="w-full h-16 rounded-2xl bg-[#1c315e] hover:bg-[#1c315e]/90 text-white font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
          {t('bookExperience')}
        </Button>
        <p className="text-[10px] text-center text-muted-foreground font-bold">{t('freeCancellation')}</p>
      </div>

      {/* Mobile Sticky Bar - Visible on small screens only */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t md:hidden z-50 flex items-center justify-between gap-4">
        <div>
            <div className="text-2xl font-black text-[#1c315e]">¥{totalPrice.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">{guests} {guests === 1 ? t('guest') : t('guests')}</div>
        </div>
        <Button className="flex-1 h-12 rounded-xl bg-[#1c315e] text-white font-black uppercase tracking-widest text-xs">
            {t('bookNow')}
        </Button>
      </div>
    </div>
  )
}
