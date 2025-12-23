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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div 
        className={cn(
          "flex items-center gap-2 px-4 h-11 rounded-full border-2 transition-all duration-300",
          isOpen 
            ? "bg-white border-primary shadow-lg w-[85vw] md:w-[400px] fixed top-4 left-1/2 -translate-x-1/2 z-[70] md:relative md:top-0 md:left-0 md:translate-x-0" 
            : "bg-muted/50 border-transparent w-[44px] md:w-[300px] hover:bg-muted"
        )}
        onClick={() => {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 50)
        }}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <Search className="h-4 w-4 text-primary/40" />}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={isOpen ? "Search Kyoto, Hacks..." : ""}
          className={cn(
            "bg-transparent border-none outline-none w-full text-sm font-medium text-primary placeholder:text-primary/30",
            !isOpen && "hidden md:block"
          )}
        />
        {!isOpen && (
            <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded border border-primary/10 bg-white text-[10px] text-primary/40 font-bold">
                <Command className="h-2.5 w-2.5" /> K
            </div>
        )}
        {isOpen && (
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); setQuery(""); }} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-4 w-4 text-primary/40" />
            </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={cn(
                "fixed top-20 left-1/2 -translate-x-1/2 w-[90vw] md:absolute md:top-full md:left-0 md:right-0 md:mt-2 md:translate-x-0 md:w-full",
                "bg-[#e6e2c3] border-2 border-primary/10 rounded-3xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col z-[70]"
            )}
          >
            {results.length > 0 ? (
              <div className="overflow-y-auto p-2">
                {categories.map((category) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary/40 flex items-center gap-2">
                      {getIcon(category)} {category}
                    </div>
                    {groupedResults[category].map((item) => {
                      const overallIndex = results.indexOf(item)
                      const isSelected = selectedIndex === overallIndex

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "px-4 py-3 rounded-2xl cursor-pointer transition-all flex flex-col gap-0.5",
                            isSelected ? "bg-white shadow-md border-l-4 border-accent" : "hover:bg-white/40"
                          )}
                          onMouseEnter={() => setSelectedIndex(overallIndex)}
                          onClick={() => navigateTo(item)}
                        >
                          <div className="font-bold text-primary flex items-center justify-between">
                            {item.title}
                            {isSelected && <div className="text-[10px] text-accent font-black">ENTER</div>}
                          </div>
                          <div className="text-xs text-primary/60 line-clamp-1">{item.subtitle}</div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary/20" />
                </div>
                <h3 className="font-bold text-primary mb-1">No results found for "{query}"</h3>
                <p className="text-sm text-primary/40">Try searching for "Kyoto" or "Suica hack."</p>
              </div>
            )}
            
            <div className="p-3 bg-primary/5 border-t border-primary/5 flex items-center justify-between text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                <span>{results.length} results found</span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><Command className="h-3 w-3" /> Navigation</span>
                    <span className="flex items-center gap-1.5">↵ Select</span>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop/Full-screen logic could be added here if needed */}
    </div>
  )
}
