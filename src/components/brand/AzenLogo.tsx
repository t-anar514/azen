import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Canonical Azen marks in /public:
 *  - default  — wordmark for light surfaces (navbar)
 *  - dark     — wordmark for navy / dark surfaces (footer)
 *  - icon     — torii mark for favicon, PWA, compact slots
 */
const VARIANTS = {
  default: {
    src: "/azen-logo.png",
    width: 200,
    height: 116,
    alt: "Azen",
  },
  dark: {
    src: "/azen-logo-dark.png",
    width: 196,
    height: 112,
    alt: "Azen",
  },
  icon: {
    src: "/azen-logo-icon.png",
    width: 116,
    height: 116,
    alt: "Azen",
  },
} as const

export type AzenLogoVariant = keyof typeof VARIANTS

interface AzenLogoProps {
  variant?: AzenLogoVariant
  /**
   * CSS height classes, e.g. "h-8 md:h-10". Width follows the asset aspect
   * via `w-auto`. Prefer this over a fixed pixel height for responsive UI.
   */
  className?: string
  /** Fallback pixel height when no height utility is passed in className. */
  height?: number
  priority?: boolean
}

export function AzenLogo({
  variant = "default",
  className,
  height = 40,
  priority = false,
}: AzenLogoProps) {
  const mark = VARIANTS[variant]
  const hasHeightClass = /\bh-/.test(className ?? "")

  return (
    <Image
      src={mark.src}
      alt={mark.alt}
      width={mark.width}
      height={mark.height}
      priority={priority}
      className={cn("w-auto object-contain", !hasHeightClass && "h-10", className)}
      style={hasHeightClass ? undefined : { height, width: "auto" }}
    />
  )
}
