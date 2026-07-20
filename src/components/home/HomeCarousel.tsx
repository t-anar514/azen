"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentCard } from "./ContentCard"
import { cn } from "@/lib/utils"

interface CarouselItem {
  id: string
  image: string | null
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const fadeFrom = sectionClassName?.includes("muted") ? "from-muted/30" : "from-background"

  if (items.length === 0) return null

  function scrollByAmount(direction: "left" | "right") {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" })
  }

  return (
    <section className={cn("py-20", sectionClassName)}>
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">{title}</h2>
            {description && <p className="mt-2 text-muted-foreground">{description}</p>}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scrollByAmount("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scrollByAmount("right")}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="w-full overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
          >
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

          {/* Edge fades hinting there's more to scroll */}
          <div className={cn("pointer-events-none absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r to-transparent", fadeFrom)} />
          <div className={cn("pointer-events-none absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l to-transparent", fadeFrom)} />
        </div>
      </div>
    </section>
  )
}
