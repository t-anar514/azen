import * as React from "react"

import { cn } from "@/lib/utils"

function Eyebrow({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="eyebrow"
      className={cn("text-eyebrow block", className)}
      {...props}
    />
  )
}

export { Eyebrow }
