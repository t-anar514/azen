"use client"

import Image from "next/image"
import { Link } from "@/i18n/routing"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ContentCardProps {
  image: string
  title: string
  description?: string
  badge?: string
  badgeColor?: string
  link: string | { pathname: string; query?: any; params?: any }
  footerLeft?: string
  footerRight?: string
  aspectRatio?: "video" | "portrait" | "square"
  className?: string
}

export function ContentCard({
  image,
  title,
  description,
  badge,
  badgeColor = "bg-[#227c70]",
  link,
  footerLeft,
  footerRight,
  aspectRatio = "video",
  className
}: ContentCardProps) {
  const aspectClass = {
    video: "aspect-[16/9]",
    portrait: "aspect-[4/5]",
    square: "aspect-square"
  }[aspectRatio]

  return (
    <Link href={link as any}>
      <Card className={cn(
        "shrink-0 border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-transparent group cursor-pointer relative overflow-hidden rounded-2xl",
        className
      )}>
        <div className="overflow-hidden rounded-xl bg-white">
          <div className={cn("relative w-full overflow-hidden", aspectClass)}>
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {badge && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className={cn("text-white border-none px-3 py-1", badgeColor)}>
                  {badge}
                </Badge>
              </div>
            )}
            {aspectRatio === "portrait" && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-5 flex flex-col justify-end">
                <h3 className="text-white font-bold text-xl whitespace-normal leading-tight">
                  {title}
                </h3>
                {description && (
                  <p className="text-white/80 text-sm mt-1 whitespace-normal line-clamp-2">
                    {description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2 text-white/90">
                  {footerLeft && <div className="text-xs uppercase tracking-wider font-semibold">{footerLeft}</div>}
                  {footerRight && <div className="font-bold text-lg">{footerRight}</div>}
                </div>
              </div>
            )}
          </div>
          {aspectRatio !== "portrait" && (
            <div className="p-5">
              <h3 className="font-bold text-xl mb-2 text-primary whitespace-normal leading-tight group-hover:text-[#227c70] transition-colors">
                {title}
              </h3>
              {description && (
                <p className="text-muted-foreground text-sm whitespace-normal line-clamp-2 mb-4">
                  {description}
                </p>
              )}
              {(footerLeft || footerRight) && (
                <div className="flex items-center justify-between mt-auto">
                  {footerLeft && (
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      {footerLeft}
                    </div>
                  )}
                  {footerRight && (
                    <div className="text-primary font-bold text-lg">
                      {footerRight}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
