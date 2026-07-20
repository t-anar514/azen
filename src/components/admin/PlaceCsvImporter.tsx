"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const KNOWN_COLUMNS = [
  "city_id", "slug", "name", "category", "subcategory", "neighborhood",
  "lat", "lng", "address", "cover_image", "short_desc", "long_desc",
  "price_band", "booking_url", "tags", "is_hidden_gem", "published",
  "order_index", "guide_name", "guide_quote",
] as const

const REQUIRED = ["city_id", "name", "category"] as const

interface RowResult {
  row: number
  id: string | null
  status: "ok" | "error"
  error?: string
  rec?: "attached" | "guide_not_found"
}

interface ImportResponse {
  dryRun: boolean
  total: number
  ok: number
  failed: number
  results: RowResult[]
}

// Quoted-field-aware CSV parser: handles commas and newlines inside "…",
// and "" as an escaped quote. Good enough for spreadsheet exports.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ",") {
      row.push(field)
      field = ""
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      field = ""
      if (row.some((f) => f !== "")) rows.push(row)
      row = []
    } else {
      field += ch
    }
  }
  row.push(field)
  if (row.some((f) => f !== "")) rows.push(row)
  return rows
}

function toObjects(rows: string[][]): { objects: Record<string, string>[]; headerError: string | null } {
  if (rows.length < 2) return { objects: [], headerError: "Need a header row plus at least one data row." }
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const unknown = header.filter((h) => !(KNOWN_COLUMNS as readonly string[]).includes(h))
  const missing = REQUIRED.filter((r) => !header.includes(r))
  if (missing.length) {
    return { objects: [], headerError: `Missing required column(s): ${missing.join(", ")}` }
  }
  const objects = rows.slice(1).map((r) => {
    const obj: Record<string, string> = {}
    header.forEach((h, i) => {
      if ((KNOWN_COLUMNS as readonly string[]).includes(h)) obj[h] = r[i] ?? ""
    })
    return obj
  })
  return {
    objects,
    headerError: unknown.length ? `Ignored unknown column(s): ${unknown.join(", ")}` : null,
  }
}

export function PlaceCsvImporter() {
  const router = useRouter()
  const [csv, setCsv] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [notice, setNotice] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<ImportResponse | null>(null)

  async function run(dryRun: boolean) {
    setBusy(true)
    setError(null)
    setNotice(null)
    setResult(null)

    const { objects, headerError } = toObjects(parseCsv(csv))
    if (objects.length === 0) {
      setError(headerError ?? "No data rows found.")
      setBusy(false)
      return
    }
    if (headerError) setNotice(headerError)

    try {
      const res = await fetch("/api/admin/places/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: objects, dryRun }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`)
      setResult(data)
      if (!dryRun) router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.")
    }
    setBusy(false)
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCsv(String(reader.result ?? ""))
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSV format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Header row required. Columns (any order; <strong>bold = required</strong>):
          </p>
          <p className="font-mono text-xs leading-6 break-words">
            <strong>city_id, name, category</strong>, slug, subcategory, neighborhood, lat, lng,
            address, cover_image, short_desc, long_desc, price_band, booking_url, tags,
            is_hidden_gem, published, order_index, guide_name, guide_quote
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><code>category</code>: things_to_do · places_to_eat · nightlife · shopping · day_trip</li>
            <li><code>tags</code>: pipe-separated — <code>ramen|late-night|cash-only</code></li>
            <li><code>slug</code> optional (derived from name); row id becomes <code>city_id-slug</code>; re-importing the same id updates it</li>
            <li><code>guide_name</code> + <code>guide_quote</code>: attaches a recommendation when the name exactly matches an existing guide</li>
            <li><code>price_band</code>: 1–4 · <code>published</code>/<code>is_hidden_gem</code>: true/false</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="file" accept=".csv,text/csv" onChange={onFile} className="text-sm" />
          <Textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={10}
            placeholder={"city_id,name,category,neighborhood,short_desc\ntokyo,Golden Gai,nightlife,Shinjuku,Tiny bars stacked into six alleys"}
            className="font-mono text-xs"
          />
          <div className="flex gap-3">
            <Button variant="outline" disabled={busy || !csv.trim()} onClick={() => run(true)}>
              {busy ? "Working…" : "Dry run (validate only)"}
            </Button>
            <Button variant="reserve" disabled={busy || !csv.trim()} onClick={() => run(false)}>
              {busy ? "Working…" : "Import"}
            </Button>
          </div>
          {notice && <p className="text-sm text-amber-600">{notice}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.dryRun ? "Dry run" : "Import"} — {result.ok}/{result.total} ok
              {result.failed > 0 ? `, ${result.failed} failed` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-4">Row</th>
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r) => (
                    <tr key={r.row} className="border-b border-border/50">
                      <td className="py-1.5 pr-4">{r.row}</td>
                      <td className="py-1.5 pr-4 font-mono text-xs">{r.id ?? "—"}</td>
                      <td className={`py-1.5 pr-4 ${r.status === "ok" ? "text-success" : "text-destructive"}`}>
                        {r.status}
                      </td>
                      <td className="py-1.5 text-muted-foreground">
                        {r.error ?? (r.rec === "attached" ? "guide rec attached"
                          : r.rec === "guide_not_found" ? "guide not found — rec skipped" : "")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
