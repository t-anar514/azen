"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import {
  Compass,
  Languages,
  MapPin,
  Search,
  UserRound,
  Zap,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import type { SearchCategory, SearchItem } from "@/data/search-data"
import { searchItems, useSearchIndex } from "@/hooks/useSearchIndex"

const SUGGESTIONS = ["Tokyo", "Kyoto", "Osaka"] as const

function categoryIcon(category: SearchCategory) {
  switch (category) {
    case "Cities":
    case "Places":
      return <MapPin className="size-4 shrink-0" />
    case "Guides":
      return <UserRound className="size-4 shrink-0" />
    case "Hacks":
    case "Posts":
      return <Zap className="size-4 shrink-0" />
    case "Experiences":
    case "Tours":
      return <Compass className="size-4 shrink-0" />
    case "Phrases":
      return <Languages className="size-4 shrink-0" />
  }
}

/** Strip leading /{locale} so next-intl router can resolve pathnames. */
function toAppPath(url: string, locale: string): string {
  const prefix = `/${locale}`
  if (url === prefix) return "/"
  if (url.startsWith(`${prefix}/`)) return url.slice(prefix.length)
  return url
}

interface HeroSearchProps {
  variant?: "desktop" | "mobile"
  className?: string
}

export function HeroSearch({ variant = "desktop", className }: HeroSearchProps) {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations("Search")
  const { fuse } = useSearchIndex(locale)
  const listId = useId()

  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [open, setOpen] = useState(false)

  const runSearch = useCallback(
    (value: string) => {
      setQuery(value)
      const next = searchItems(fuse, value)
      setResults(next)
      setSelectedIndex(0)
      setOpen(true)
    },
    [fuse]
  )

  const navigateTo = useCallback(
    (item: SearchItem) => {
      router.push(toAppPath(item.url, locale) as any)
      setOpen(false)
      setQuery("")
      setResults([])
      inputRef.current?.blur()
    },
    [locale, router]
  )

  // Keep results in sync when the fuse index finishes loading mid-query.
  useEffect(() => {
    if (!query.trim()) return
    setResults(searchItems(fuse, query))
  }, [fuse, query])

  // ⌘K / Ctrl+K focuses this bar when it is the visible hero instance
  // (mobile + desktop are both mounted; only one is displayed).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return
      const input = inputRef.current
      if (!input || input.offsetParent === null) return
      e.preventDefault()
      e.stopPropagation()
      setOpen(true)
      input.focus()
      input.select()
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [])

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointer)
    return () => document.removeEventListener("mousedown", onPointer)
  }, [])

  function onKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (!open) setOpen(true)
      setSelectedIndex((i) => (i + 1) % Math.max(results.length, 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => (i - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results[selectedIndex]) navigateTo(results[selectedIndex])
    } else if (e.key === "Escape") {
      e.preventDefault()
      if (query) {
        setQuery("")
        setResults([])
      } else {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
  }

  const showPanel = open && (query.length > 0 || variant === "desktop")
  const isMobile = variant === "mobile"

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex w-full items-center gap-3 bg-card transition-colors",
          isMobile
            ? "rounded-2xl px-4 py-3.5 shadow-[0_12px_28px_-12px_rgba(0,0,0,.4)]"
            : "rounded-2xl border border-[#E2E8F0] bg-[#F6F8FB] px-[18px] py-3.5 focus-within:border-[#1A4E8A]/40 focus-within:bg-white"
        )}
      >
        <Search
          className="size-5 shrink-0 text-[#1A4E8A]"
          strokeWidth={2}
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => runSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t("heroPlaceholder")}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel && results[selectedIndex]
              ? `${listId}-option-${selectedIndex}`
              : undefined
          }
          className={cn(
            "min-w-0 flex-1 bg-transparent text-[15.5px] text-[#16202B] outline-none placeholder:text-[#94A3B8]",
            isMobile && "text-sm"
          )}
        />
        {!isMobile && (
          <kbd className="pointer-events-none select-none rounded-lg bg-[#EAF2FB] px-2.5 py-[5px] text-xs font-semibold text-[#1A4E8A]">
            ⌘K
          </kbd>
        )}
      </div>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className={cn(
            "absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_20px_40px_-16px_rgba(0,0,0,.35)]",
            isMobile && "mt-2"
          )}
        >
          {query.length === 0 ? (
            <div className="p-4">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                {t("suggestions")}
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      runSearch(city)
                      inputRef.current?.focus()
                    }}
                    className="rounded-full border border-[#E2E8F0] px-3.5 py-1.5 text-xs font-semibold text-[#16202B] transition-colors hover:bg-[#F6F8FB]"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-[min(360px,50vh)] overflow-y-auto p-1.5">
              {results.map((item, index) => {
                const active = index === selectedIndex
                return (
                  <li key={item.id} role="option" aria-selected={active}>
                    <button
                      type="button"
                      id={`${listId}-option-${index}`}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => navigateTo(item)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        active ? "bg-[#1A4E8A] text-white" : "hover:bg-[#F6F8FB]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5",
                          active ? "text-white/80" : "text-[#1A4E8A]"
                        )}
                      >
                        {categoryIcon(item.category)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {item.title}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block truncate text-xs",
                            active ? "text-white/75" : "text-[#64748B]"
                          )}
                        >
                          {t(`categories.${item.category}`)}
                          {item.subtitle ? ` · ${item.subtitle}` : ""}
                        </span>
                      </span>
                      {active && (
                        <span className="mt-0.5 hidden text-[10px] font-bold uppercase tracking-wider text-white/60 sm:block">
                          ↵
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-semibold text-[#16202B]">
                {t("noResults", { query })}
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">{t("trySearching")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
