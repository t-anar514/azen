"use client"

import Image from "next/image"
import { Link } from "@/i18n/routing"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { SAMPLE_ITINERARIES } from "@/data/templates"
import { useTranslations } from "next-intl"

export function SampleItineraries() {
  const t = useTranslations("SampleItineraries")

  return (
    <section className="py-20 bg-muted/30">
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
            <div>
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">{t('title')}</h2>
                <p className="mt-2 text-muted-foreground">{t('description')}</p>
            </div>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap rounded-xl">
          <div className="flex w-max space-x-6 p-4">
            {SAMPLE_ITINERARIES.map((item) => (
              <Link key={item.id} href={{pathname: '/planner', query: {template: item.id}} as any}>
                <Card className="w-[280px] md:w-[350px] lg:w-[420px] shrink-0 border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-transparent group cursor-pointer relative overflow-hidden rounded-2xl">
                  <div className="overflow-hidden rounded-xl">
                      <div className="relative aspect-[16/9] w-full">
                           <Image
                              src={item.heroImage}
                              alt={t(`${item.id}.title`)}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-4 left-4">
                              <Badge className="bg-[#227c70] text-white hover:bg-[#227c70]/90 border-none px-3 py-1">
                                {item.duration} {item.duration === 1 ? t('day') : t('days')}
                              </Badge>
                          </div>
                      </div>
                      <div className="p-5 bg-white">
                           <h3 className="font-bold text-xl mb-2 text-primary whitespace-normal leading-tight group-hover:text-[#227c70] transition-colors">
                             {t(`${item.id}.title`)}
                           </h3>
                           <p className="text-muted-foreground text-sm whitespace-normal line-clamp-2 mb-4">
                             {t(`${item.id}.summary`)}
                           </p>
                           <div className="flex items-center justify-between mt-auto">
                               <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                 {t('estimatedFrom')}
                               </div>
                               <div className="text-primary font-bold text-lg">
                                 ¥{item.basePrice.toLocaleString()}
                               </div>
                           </div>
                      </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  )
}
