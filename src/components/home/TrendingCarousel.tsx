"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { EXPERIENCES } from "@/data/experiences"

export function TrendingCarousel() {
  return (
    <section className="py-20">
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
            <div>
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">Trending Experiences</h2>
                <p className="mt-2 text-muted-foreground">What other travelers are booking right now.</p>
            </div>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap rounded-xl">
          <div className="flex w-max space-x-6 p-4">
            {EXPERIENCES.map((item) => (
              <Link key={item.id} href={`/experiences/${item.id}`}>
                <Card className="w-[280px] md:w-[350px] lg:w-[420px] shrink-0 border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-transparent group cursor-pointer relative overflow-hidden rounded-2xl">
                  <div className="overflow-hidden rounded-xl">
                      <div className="relative aspect-[4/5] w-full">
                           <Image
                              src={item.heroImage}
                              alt={item.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
                              <Badge className="w-fit mb-2 bg-[#88a47c] text-white hover:bg-[#88a47c]/90 border-none">{item.category}</Badge>
                               <h3 className="text-white font-bold text-lg whitespace-normal leading-tight">{item.title}</h3>
                               <p className="text-white/80 text-sm">{item.location}</p>
                               <div className="mt-2 text-white font-medium">From ¥{item.basePrice.toLocaleString()}</div>
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
