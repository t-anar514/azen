"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ContentCard } from "./ContentCard"
import { cn } from "@/lib/utils"

interface CarouselItem {
  id: string
  image: string
  title: string
  description?: string
  badge?: string
  badgeColor?: string
  link: string | { pathname: string; query?: any; params?: any }
  footerLeft?: string
  footerRight?: string
}

interface HomeCarouselProps {
  title: string
  description?: string
  items: CarouselItem[]
  aspectRatio?: "video" | "portrait" | "square"
  cardWidth?: string
  sectionClassName?: string
}

export function HomeCarousel({
  title,
  description,
  items,
  aspectRatio = "video",
  cardWidth = "w-[280px] md:w-[350px] lg:w-[420px]",
  sectionClassName
}: HomeCarouselProps) {
  return (
    <section className={cn("py-20", sectionClassName)}>
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">{title}</h2>
            {description && <p className="mt-2 text-muted-foreground">{description}</p>}
          </div>
        </div>
        
        <div className="w-full overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
          <div className="flex w-max gap-4 md:gap-6 p-1 md:p-4">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className={cn(
                  cardWidth,
                  index === 0 ? "ml-4 md:ml-0" : "",
                  index === items.length - 1 ? "mr-4 md:mr-0" : ""
                )}
              >
                <ContentCard
                  image={item.image}
                  title={item.title}
                  description={item.description}
                  badge={item.badge}
                  badgeColor={item.badgeColor}
                  link={item.link}
                  footerLeft={item.footerLeft}
                  footerRight={item.footerRight}
                  aspectRatio={aspectRatio}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
