"use client"

import * as React from "react"
import { useLocale } from "next-intl"
import { routing, usePathname, useRouter } from "@/i18n/routing"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import { useParams } from "next/navigation"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  function onLanguageChange(newLocale: string) {
    router.replace(
      // @ts-ignore
      { pathname, params },
      { locale: newLocale }
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 h-9">
          <Languages className="h-4 w-4" />
          <span className="uppercase text-xs font-semibold">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((cur) => (
          <DropdownMenuItem
            key={cur}
            onClick={() => onLanguageChange(cur)}
            className={locale === cur ? "bg-accent text-accent-foreground font-semibold" : ""}
          >
            {cur.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
