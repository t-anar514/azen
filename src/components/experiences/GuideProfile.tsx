"use client"

import { Experience } from "@/data/experiences"
import { CheckCircle2, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function GuideProfile({ guide }: { guide: Experience['guide'] }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:shadow-lg transition-all duration-300">
      <div className="relative shrink-0">
        <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-xl">
            <AvatarImage src={guide.image} className="object-cover" />
            <AvatarFallback>{guide.name[0]}</AvatarFallback>
        </Avatar>
        {guide.isVerified && (
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                <CheckCircle2 className="w-6 h-6 text-[#227c70]" />
            </div>
        )}
      </div>

      <div className="flex-1 text-center md:text-left space-y-4">
        <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h3 className="text-2xl font-black text-[#1c315e]">{guide.name}</h3>
                <span className="bg-[#227c70]/10 text-[#227c70] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-tighter">Verified Local</span>
            </div>
            <p className="text-[#1c315e]/70 font-bold italic leading-relaxed">&quot;{guide.bio}&quot;</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <Button variant="outline" className="rounded-xl border-2 border-[#1c315e]/10 font-bold tracking-tight hover:bg-white flex gap-2">
                <MessageCircle className="w-4 h-4" /> Message {guide.name}
            </Button>
            <div className="text-xs font-black uppercase tracking-widest text-[#1c315e]/40">Response time: ~15 mins</div>
        </div>
      </div>
    </div>
  )
}
