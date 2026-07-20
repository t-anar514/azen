import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/requireAdmin"
import { slugify } from "@/lib/slugify"
import type { PlaceCategory } from "@/lib/supabase/types"

const CATEGORIES: PlaceCategory[] = [
  "things_to_do",
  "places_to_eat",
  "nightlife",
  "shopping",
  "day_trip",
]

interface ImportRow {
  city_id?: string
  slug?: string
  name?: string
  category?: string
  subcategory?: string
  neighborhood?: string
  lat?: string | number
  lng?: string | number
  address?: string
  cover_image?: string
  short_desc?: string
  long_desc?: string
  price_band?: string | number
  booking_url?: string
  tags?: string | string[]
  is_hidden_gem?: string | boolean
  published?: string | boolean
  order_index?: string | number
  guide_name?: string
  guide_quote?: string
}

interface RowResult {
  row: number
  id: string | null
  status: "ok" | "error"
  error?: string
  rec?: "attached" | "guide_not_found"
}

function num(v: string | number | undefined): number | null {
  if (v === undefined || v === "") return null
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function bool(v: string | boolean | undefined, fallback: boolean): boolean {
  if (v === undefined || v === "") return fallback
  if (typeof v === "boolean") return v
  return ["true", "1", "yes", "y"].includes(v.toLowerCase())
}

function tagList(v: string | string[] | undefined): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v.filter(Boolean)
  return v.split("|").map((t) => t.trim()).filter(Boolean)
}

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error
  const { supabase } = guard

  const body = await request.json().catch(() => null)
  const rows: ImportRow[] = body?.rows
  const dryRun: boolean = body?.dryRun ?? false
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "rows array is required" }, { status: 400 })
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: "max 500 rows per import" }, { status: 400 })
  }

  const [{ data: cities }, { data: guides }] = await Promise.all([
    supabase.from("cities").select("id"),
    supabase.from("guides").select("id, name"),
  ])
  const cityIds = new Set((cities ?? []).map((c) => c.id))
  const guideByName = new Map(
    (guides ?? []).map((g) => [g.name.trim().toLowerCase(), g.id])
  )

  const results: RowResult[] = []

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const rowNo = i + 1

    if (!r.name?.trim()) {
      results.push({ row: rowNo, id: null, status: "error", error: "name is required" })
      continue
    }
    if (!r.city_id || !cityIds.has(r.city_id)) {
      results.push({ row: rowNo, id: null, status: "error", error: `unknown city_id "${r.city_id ?? ""}"` })
      continue
    }
    if (!r.category || !CATEGORIES.includes(r.category as PlaceCategory)) {
      results.push({
        row: rowNo, id: null, status: "error",
        error: `category must be one of: ${CATEGORIES.join(", ")}`,
      })
      continue
    }
    const priceBand = num(r.price_band)
    if (priceBand !== null && (priceBand < 1 || priceBand > 4)) {
      results.push({ row: rowNo, id: null, status: "error", error: "price_band must be 1-4" })
      continue
    }

    const slug = r.slug?.trim() ? slugify(r.slug) : slugify(r.name)
    const id = `${r.city_id}-${slug}`
    const guideName = r.guide_name?.trim()
    const guideId = guideName ? guideByName.get(guideName.toLowerCase()) : undefined

    if (dryRun) {
      results.push({
        row: rowNo, id, status: "ok",
        ...(guideName ? { rec: guideId ? "attached" as const : "guide_not_found" as const } : {}),
      })
      continue
    }

    const { error } = await supabase.from("places").upsert(
      {
        id,
        city_id: r.city_id,
        slug,
        name: r.name.trim(),
        category: r.category,
        subcategory: r.subcategory?.trim() || null,
        neighborhood: r.neighborhood?.trim() || null,
        lat: num(r.lat),
        lng: num(r.lng),
        address: r.address?.trim() || null,
        cover_image: r.cover_image?.trim() || null,
        short_desc: r.short_desc?.trim() || null,
        long_desc: r.long_desc?.trim() || null,
        price_band: priceBand,
        booking_url: r.booking_url?.trim() || null,
        tags: tagList(r.tags),
        is_hidden_gem: bool(r.is_hidden_gem, false),
        published: bool(r.published, true),
        order_index: num(r.order_index) ?? 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )

    if (error) {
      results.push({ row: rowNo, id, status: "error", error: error.message })
      continue
    }

    let rec: RowResult["rec"]
    if (guideName && r.guide_quote?.trim()) {
      if (guideId) {
        const { error: recError } = await supabase.from("place_recommendations").upsert(
          { place_id: id, guide_id: guideId, quote: r.guide_quote.trim() },
          { onConflict: "place_id,guide_id" }
        )
        rec = recError ? "guide_not_found" : "attached"
      } else {
        rec = "guide_not_found"
      }
    }

    results.push({ row: rowNo, id, status: "ok", ...(rec ? { rec } : {}) })
  }

  const okCount = results.filter((r) => r.status === "ok").length
  return NextResponse.json({
    dryRun,
    total: rows.length,
    ok: okCount,
    failed: rows.length - okCount,
    results,
  })
}
