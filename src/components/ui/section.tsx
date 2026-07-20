import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sectionVariants = cva("py-section lg:py-section-lg", {
  variants: {
    tint: {
      none: "",
      muted: "bg-muted/30",
      sky: "bg-tint-sky/50",
      saffron: "bg-tint-saffron/50",
      sage: "bg-tint-sage/50",
      lilac: "bg-tint-lilac/50",
    },
  },
  defaultVariants: {
    tint: "none",
  },
})

function Section({
  className,
  innerClassName,
  tint,
  children,
  ...props
}: React.ComponentProps<"section"> &
  VariantProps<typeof sectionVariants> & { innerClassName?: string }) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ tint }), className)}
      {...props}
    >
      <div className={cn("mx-auto max-w-content px-4 md:px-6", innerClassName)}>
        {children}
      </div>
    </section>
  )
}

export { Section, sectionVariants }
