"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// Mock data for trending experiences (since guides.json is for people)
const TRENDING_EXPERIENCES = [
  {
    id: 1,
    title: "Kyoto Tea Ceremony",
    location: "Higashiyama, Kyoto",
    price: "¥4,500",
    image: "https://images.unsplash.com/photo-1545060411-827fc516f849?q=80&w=600&auto=format&fit=crop",
    tag: "Cultural"
  },
  {
    id: 2,
    title: "Osaka Street Food Walk",
    location: "Dotonbori, Osaka",
    price: "¥3,000",
    image: "https://images.unsplash.com/photo-1590559899731-a363c37ee66c?q=80&w=600&auto=format&fit=crop",
    tag: "Food"
  },
  {
    id: 3,
    title: "Akihabara Tech Tour",
    location: "Akihabara, Tokyo",
    price: "¥2,000",
    image: "https://images.unsplash.com/photo-1582236240224-b3e949d0dd44?q=80&w=600&auto=format&fit=crop",
    tag: "Geek"
  },
  {
    id: 4,
    title: "Hidden Shibuya Bars",
    location: "Shibuya, Tokyo",
    price: "¥5,000",
    image: "https://images.unsplash.com/photo-1554797589-7241bb691973?q=80&w=600&auto=format&fit=crop",
    tag: "Nightlife"
  },
   {
    id: 5,
    title: "Mount Fuji Day Trip",
    location: "Kawaguchiko",
    price: "¥8,000",
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?q=80&w=600&auto=format&fit=crop",
    tag: "Nature"
  }
]

export function TrendingCarousel() {
  return (
    <section className="py-20">
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
            <div>
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">Trending Experiences</h2>
                <p className="mt-2 text-muted-foreground">What other travelers are booking right now.</p>
            </div>
            {/* <Button variant="link" className="hidden md:inline-flex">View All</Button> */}
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap rounded-xl">
          <div className="flex w-max space-x-6 p-4">
            {TRENDING_EXPERIENCES.map((item) => (
              <Card key={item.id} className="w-[280px] md:w-[350px] lg:w-[420px] shrink-0 border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-transparent group cursor-pointer relative overflow-hidden rounded-2xl">
                <div className="overflow-hidden rounded-xl">
                    <div className="relative aspect-[4/5] w-full">
                         <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
                            <Badge variant="secondary" className="w-fit mb-2">{item.tag}</Badge>
                             <h3 className="text-white font-bold text-lg whitespace-normal leading-tight">{item.title}</h3>
                             <p className="text-white/80 text-sm">{item.location}</p>
                             <div className="mt-2 text-white font-medium">From {item.price}</div>
                        </div>
                    </div>
                </div>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  )
}
