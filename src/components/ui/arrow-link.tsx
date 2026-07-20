import * as React from "react"
import { ArrowRight } from "lucide-react"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

type ArrowLinkProps = React.ComponentProps<typeof Link>

function ArrowLink({ className, children, ...props }: ArrowLinkProps) {
  return (
    <Link
      data-slot="arrow-link"
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4",
        className
      )}
      {...props}
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

export { ArrowLink }
