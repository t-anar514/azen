"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Command, Loader2, MapPin, Zap, Compass, Languages } from "lucide-react"
import Fuse from "fuse.js"
import { cn } from "@/lib/utils"
import { getSearchIndex, SearchItem, SearchCategory } from "@/data/search-data"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations, useMessages } from "next-intl"

interface GlobalSearchProps {
  locale: string
  className?: string
}

export function GlobalSearch({ locale, className }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [searchIndex, setSearchIndex] = useState<SearchItem[]>([])
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null)
  const messages = useMessages()
  const tSearch = useTranslations("Search")


  // Initialize Fuse
  useEffect(() => {
    const data = getSearchIndex(locale, messages)
    setSearchIndex(data)
    setFuse(new Fuse(data, {
      keys: ['title', 'subtitle'],
      threshold: 0.3,
      distance: 100,
      includeMatches: true
    }))
  }, [locale, messages])

  const handleSearch = useCallback((val: string) => {
    setQuery(val)
    if (!val || !fuse) {
      setResults([])
      return
    }

    setIsLoading(true)
    // Simulate slight delay for "high performance" feel with spinner
    setTimeout(() => {
      const searchResults = fuse.search(val).map(r => r.item)
      setResults(searchResults.slice(0, 8))
      setSelectedIndex(0)
      setIsLoading(false)
    }, 150)
  }, [fuse])

  const navigateTo = (item: SearchItem) => {
    router.push(item.url)
    setIsOpen(false)
    setQuery("")
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
        if (!isOpen) inputRef.current?.focus()
      }

      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results.length > 0) {
          navigateTo(results[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getIcon = (category: SearchCategory) => {
    switch (category) {
      case 'Cities': return <MapPin className="h-4 w-4" />
      case 'Hacks': return <Zap className="h-4 w-4" />
      case 'Experiences': return <Compass className="h-4 w-4" />
      case 'Phrases': return <Languages className="h-4 w-4" />
    }
  }

  // Group results by category
  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<SearchCategory, SearchItem[]>)

  const categories = Object.keys(groupedResults) as SearchCategory[]

  return (
    <div ref={searchRef} className={cn("relative z-50", className)}>
      {/* Mobile Search Trigger Button (only visible on mobile when closed) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-full bg-muted/50 text-primary/40 hover:bg-muted transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
      )}

      {/* Desktop Search Toggle / Mobile Overlay Content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for Desktop only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm hidden md:block"
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile Full-screen Container / Desktop Relative Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "z-[70] transition-all duration-300",
                "fixed inset-0 bg-[#fefdf4] md:absolute md:inset-auto md:top-0 md:left-0 md:w-[400px] md:bg-white md:rounded-3xl md:shadow-2xl md:border-2 md:border-primary/5"
              )}
            >
              {/* Search Header */}
              <div className="flex items-center gap-3 p-4 md:p-3 border-b md:border-none">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-accent shrink-0" />
                ) : (
                  <Search className="h-5 w-5 text-primary/40 shrink-0" />
                )}
                
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={tSearch("placeholder")}
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none text-lg md:text-sm font-medium text-primary placeholder:text-primary/30"
                />

                <button 
                  onClick={() => { setIsOpen(false); setQuery(""); }} 
                  className="p-2 hover:bg-black/5 rounded-full transition-colors md:hidden"
                >
                  <X className="h-6 w-6 text-primary" />
                </button>
                
                <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded border border-primary/10 bg-muted/50 text-[10px] text-primary/40 font-bold uppercase tracking-tighter">
                  ESC
                </div>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto px-2 pb-20 md:pb-4 max-h-[calc(100vh-80px)] md:max-h-[500px]">
                {query.length > 0 ? (
                  results.length > 0 ? (
                    <div className="space-y-6 md:space-y-4 pt-4 md:pt-0">
                      {categories.map((category) => (
                        <div key={category}>
                          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary/40 flex items-center gap-2">
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
                                    "px-4 py-4 md:py-3 rounded-2xl cursor-pointer transition-all flex flex-col gap-0.5",
                                    isSelected ? "bg-[#227c70] text-white shadow-lg" : "hover:bg-black/5"
                                  )}
                                  onMouseEnter={() => setSelectedIndex(overallIndex)}
                                  onClick={() => navigateTo(item)}
                                >
                                  <div className="font-bold flex items-center justify-between text-base md:text-sm">
                                    {item.title}
                                    {isSelected && <div className="hidden md:block text-[10px] opacity-60 font-black">ENTER</div>}
                                  </div>
                                  <div className={cn(
                                    "text-xs line-clamp-1",
                                    isSelected ? "text-white/80" : "text-primary/60"
                                  )}>
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
                      <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="h-8 w-8 text-primary/20" />
                      </div>
                      <h3 className="font-bold text-primary mb-1">{tSearch("noResults", { query })}</h3>
                      <p className="text-sm text-primary/40">{tSearch("trySearching")}</p>
                    </div>
                  )
                ) : (
                  <div className="py-12 md:py-8 px-4">
                     <div className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-4">{tSearch("recentSearches") || "Нүүр хуудас"}</div>
                     <div className="flex flex-wrap gap-2">
                        {['Tokyo', 'Kyoto', 'Osaka'].map(city => (
                          <button 
                            key={city}
                            onClick={() => handleSearch(city)}
                            className="px-4 py-2 rounded-full border border-primary/10 text-xs font-bold text-primary hover:bg-black/5 transition-colors"
                          >
                             {city}
                          </button>
                        ))}
                     </div>
                  </div>
                )}
              </div>

              {/* Footer (Desktop only or optional) */}
              <div className="hidden md:flex p-3 bg-primary/5 border-t border-primary/5 items-center justify-between text-[10px] font-bold text-primary/40 uppercase tracking-widest rounded-b-3xl">
                  <span>{tSearch("resultsFound", { count: results.length })}</span>
                  <div className="flex gap-4">
                      <span className="flex items-center gap-1.5"><Command className="h-3 w-3" /> {tSearch("navigation")}</span>
                      <span className="flex items-center gap-1.5">↵ {tSearch("select")}</span>
                  </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Desktop Mini-Trigger (visible only on desktop when closed) */}
        {!isOpen && (
          <div 
            className="hidden md:flex items-center gap-2 px-4 h-11 w-[300px] rounded-full bg-muted/50 border-2 border-transparent hover:bg-muted cursor-pointer transition-all"
            onClick={() => {
              setIsOpen(true)
              setTimeout(() => inputRef.current?.focus(), 50)
            }}
          >
            <Search className="h-4 w-4 text-primary/40" />
            <span className="text-sm font-medium text-primary/40">{tSearch("placeholder")}</span>
            <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded border border-primary/10 bg-white text-[10px] text-primary/40 font-bold">
                <Command className="h-2.5 w-2.5" /> K
            </div>
          </div>
        )}
      </AnimatePresence>


      {/* Mobile Backdrop/Full-screen logic could be added here if needed */}
    </div>
  )
}
