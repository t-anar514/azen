"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { FALLBACK_RATES, Rates } from "@/lib/currency/format"

export interface ExchangeRatesState {
  rates: Rates
  // ISO timestamp of the cached snapshot, null until (unless) the DB row loads —
  // null means we're still on the compile-time fallback seed.
  fetchedAt: string | null
}

// Loads the cached FX snapshot (exchange_rates singleton row, refreshed daily
// by /api/cron/exchange-rates). Starts on FALLBACK_RATES and keeps whatever is
// already in state if the fetch fails — a stale or seed rate always beats a
// blank or a crash over a currency label.
export function useExchangeRates(): ExchangeRatesState {
  const [state, setState] = useState<ExchangeRatesState>({
    rates: FALLBACK_RATES,
    fetchedAt: null,
  })

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    supabase
      .from("exchange_rates")
      .select("rates, fetched_at")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error || !data?.rates) return
        setState({ rates: data.rates as Rates, fetchedAt: data.fetched_at })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
