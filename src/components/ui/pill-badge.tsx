import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const pillBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-pill px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 gap-1.5 [&>svg]:size-3.5 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        sky: "bg-tint-sky text-sky-700",
        saffron: "bg-tint-saffron text-saffron-600",
        sage: "bg-tint-sage text-success",
        lilac: "bg-tint-lilac text-lilac-600",
      },
    },
    defaultVariants: {
      variant: "sky",
    },
  }
)

function PillBadge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof pillBadgeVariants>) {
  return (
    <span
      data-slot="pill-badge"
      className={cn(pillBadgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { PillBadge, pillBadgeVariants }
