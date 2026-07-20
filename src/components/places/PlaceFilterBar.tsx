"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const selectClass =
  "border-input dark:bg-input/30 h-9 rounded-full border bg-card px-3 text-sm shadow-xs outline-none"

export interface PlaceFilters {
  q: string
  neighborhood: string
  price: string
}

interface PlaceFilterBarProps {
  neighborhoods: string[]
  filters: PlaceFilters
  onChange: (filters: PlaceFilters) => void
}

export function PlaceFilterBar({ neighborhoods, filters, onChange }: PlaceFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          placeholder="Хайх…"
          className="h-9 w-44 rounded-full pl-9 bg-card"
        />
      </div>

      <select
        value={filters.neighborhood}
        onChange={(e) => onChange({ ...filters, neighborhood: e.target.value })}
        className={selectClass}
        aria-label="Дүүрэг"
      >
        <option value="">Бүх дүүрэг</option>
        {neighborhoods.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <select
        value={filters.price}
        onChange={(e) => onChange({ ...filters, price: e.target.value })}
        className={selectClass}
        aria-label="Үнийн түвшин"
      >
        <option value="">Бүх үнэ</option>
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>
            {"¥".repeat(n)}
          </option>
        ))}
      </select>
    </div>
  )
}
