import NextImage from "next/image"

import { cn } from "@/lib/utils"

const Image = NextImage as any

// 2×2 rounded photo grid. Renders whatever it's given (1–4 images).
export function ImageMosaic({
  images,
  className,
}: {
  images: { src: string; alt: string }[]
  className?: string
}) {
  if (images.length === 0) return null

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {images.slice(0, 4).map((image, i) => (
        <div
          key={`${image.src}-${i}`}
          className={cn(
            "relative overflow-hidden rounded-thumb bg-muted",
            // stagger the tiles so the grid doesn't read as a flat table
            i % 2 === 0 ? "aspect-[4/5]" : "aspect-[4/5] translate-y-4"
          )}
        >
          <Image src={image.src} alt={image.alt} fill className="object-cover" />
        </div>
      ))}
    </div>
  )
}
