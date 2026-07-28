"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Search,
  X,
  Command,
  MapPin,
  Zap,
  Compass,
  Languages,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SearchItem, SearchCategory } from "@/data/search-data"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "@/i18n/routing"
import { searchItems, useSearchIndex } from "@/hooks/useSearchIndex"

export const OPEN_SEARCH_EVENT = "azen:open-search"

export function openGlobalSearch() {
  window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))
}

/** Strip leading /{locale} so next-intl router can resolve pathnames. */
function toAppPath(url: string, locale: string): string {
  const prefix = `/${locale}`
  if (url === prefix) return "/"
  if (url.startsWith(`${prefix}/`)) return url.slice(prefix.length)
  return url
}

/**
 * Site-wide ⌘K command palette. Hidden until opened — the homepage hero has
 * its own inline search and captures ⌘K while mounted.
 */
export function GlobalSearch() {
  const locale = useLocale()
  const router = useRouter()
  const { fuse } = useSearchIndex(locale)
  const tSearch = useTranslations("Search")

  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = useCallback(
    (val: string) => {
      setQuery(val)
      setResults(searchItems(fuse, val))
      setSelectedIndex(0)
    },
    [fuse]
  )

  const navigateTo = useCallback(
    (item: SearchItem) => {
      router.push(toAppPath(item.url, locale) as any)
      setIsOpen(false)
      setQuery("")
      setResults([])
    },
    [locale, router]
  )

  const open = useCallback(() => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setResults(searchItems(fuse, query))
  }, [fuse, query])

  useEffect(() => {
    const onOpen = () => open()
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, onOpen)
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsOpen((prev) => {
          const next = !prev
          if (next) setTimeout(() => inputRef.current?.focus(), 50)
          return next
        })
        return
      }

      if (!isOpen) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(
          (prev) => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1)
        )
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (results[selectedIndex]) navigateTo(results[selectedIndex])
      } else if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, results, selectedIndex, navigateTo])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const getIcon = (category: SearchCategory) => {
    switch (category) {
      case "Cities":
      case "Places":
        return <MapPin className="h-4 w-4" />
      case "Guides":
        return <UserRound className="h-4 w-4" />
      case "Hacks":
      case "Posts":
        return <Zap className="h-4 w-4" />
      case "Experiences":
      case "Tours":
        return <Compass className="h-4 w-4" />
      case "Phrases":
        return <Languages className="h-4 w-4" />
    }
  }

  const groupedResults = results.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {} as Record<SearchCategory, SearchItem[]>
  )

  const categories = Object.keys(groupedResults) as SearchCategory[]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            ref={searchRef}
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            className={cn(
              "fixed inset-0 z-[70] bg-[#fefdf4] md:inset-auto md:left-1/2 md:top-[12vh] md:w-full md:max-w-[520px] md:-translate-x-1/2",
              "md:rounded-3xl md:border md:border-primary/10 md:bg-white md:shadow-2xl"
            )}
          >
            <div className="flex items-center gap-3 border-b border-primary/5 p-4 md:p-3">
              <Search className="h-5 w-5 shrink-0 text-primary/40" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={tSearch("placeholder")}
                autoFocus
                className="flex-1 border-none bg-transparent text-lg font-medium text-primary outline-none placeholder:text-primary/30 md:text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setQuery("")
                }}
                className="rounded-full p-2 transition-colors hover:bg-black/5 md:hidden"
              >
                <X className="h-6 w-6 text-primary" />
              </button>
              <div className="hidden items-center gap-1.5 rounded border border-primary/10 bg-muted/50 px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-primary/40 md:flex">
                ESC
              </div>
            </div>

            <div className="max-h-[calc(100vh-80px)] flex-1 overflow-y-auto px-2 pb-20 md:max-h-[420px] md:pb-4">
              {query.length > 0 ? (
                results.length > 0 ? (
                  <div className="space-y-6 pt-4 md:space-y-4 md:pt-0">
                    {categories.map((category) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary/40">
                          {getIcon(category)} {tSearch(`categories.${category}`)}
                        </div>
                        <div className="space-y-1">
                          {groupedResults[category].map((item) => {
                            const overallIndex = results.indexOf(item)
                            const isSelected = selectedIndex === overallIndex

                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "flex cursor-pointer flex-col gap-0.5 rounded-2xl px-4 py-4 transition-all md:py-3",
                                  isSelected
                                    ? "bg-primary text-white shadow-lg"
                                    : "hover:bg-black/5"
                                )}
                                onMouseEnter={() => setSelectedIndex(overallIndex)}
                                onClick={() => navigateTo(item)}
                              >
                                <div className="flex items-center justify-between text-base font-bold md:text-sm">
                                  {item.title}
                                  {isSelected && (
                                    <div className="hidden text-[10px] font-black opacity-60 md:block">
                                      ENTER
                                    </div>
                                  )}
                                </div>
                                <div
                                  className={cn(
                                    "line-clamp-1 text-xs",
                                    isSelected ? "text-white/80" : "text-primary/60"
                                  )}
                                >
                                  {item.subtitle}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
                      <Search className="h-8 w-8 text-primary/20" />
                    </div>
                    <h3 className="mb-1 font-bold text-primary">
                      {tSearch("noResults", { query })}
                    </h3>
                    <p className="text-sm text-primary/40">{tSearch("trySearching")}</p>
                  </div>
                )
              ) : (
                <div className="px-4 py-12 md:py-8">
                  <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-primary/30">
                    {tSearch("suggestions")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Tokyo", "Kyoto", "Osaka"].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleSearch(city)}
                        className="rounded-full border border-primary/10 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-black/5"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden items-center justify-between rounded-b-3xl border-t border-primary/5 bg-primary/5 p-3 text-[10px] font-bold uppercase tracking-widest text-primary/40 md:flex">
              <span>{tSearch("resultsFound", { count: results.length })}</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5">
                  <Command className="h-3 w-3" /> {tSearch("navigation")}
                </span>
                <span className="flex items-center gap-1.5">↵ {tSearch("select")}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
