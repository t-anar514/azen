"use client"

import { useEffect, useState } from "react"
import Fuse from "fuse.js"
import { useMessages } from "next-intl"
import { getSearchIndex, type SearchItem } from "@/data/search-data"

export function useSearchIndex(locale: string) {
  const messages = useMessages()
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const staticData = getSearchIndex(locale, messages)

    const build = (data: SearchItem[]) => {
      setFuse(
        new Fuse(data, {
          keys: ["title", "subtitle"],
          threshold: 0.3,
          distance: 100,
          includeMatches: true,
        })
      )
      setReady(true)
    }

    build(staticData)

    let cancelled = false
    fetch("/api/search")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((json) => {
        if (cancelled) return
        const dbItems: SearchItem[] = (json.items ?? []).map((it: SearchItem) => ({
          ...it,
          // API returns locale-free paths; prefix for next/navigation pushes.
          url: it.url.startsWith(`/${locale}`) ? it.url : `/${locale}${it.url}`,
        }))
        if (dbItems.length) build([...staticData, ...dbItems])
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [locale, messages])

  return { fuse, ready }
}

export function searchItems(
  fuse: Fuse<SearchItem> | null,
  query: string,
  limit = 8
): SearchItem[] {
  if (!query.trim() || !fuse) return []
  return fuse.search(query.trim()).map((r) => r.item).slice(0, limit)
}
