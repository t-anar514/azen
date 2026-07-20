"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const selectClass =
  "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none"

interface Rec {
  id: string
  guide_id: string
  quote: string
  guides: { id: string; name: string; image: string | null } | null
}

interface PlaceRecsEditorProps {
  placeId: string
  guides: { id: string; name: string }[]
}

// The trust device: attach named-guide quotes to a place. Without these,
// places is just a directory — see master plan, opinionated call #2.
export function PlaceRecsEditor({ placeId, guides }: PlaceRecsEditorProps) {
  const [recs, setRecs] = React.useState<Rec[]>([])
  const [guideId, setGuideId] = React.useState(guides[0]?.id ?? "")
  const [quote, setQuote] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    const res = await fetch(`/api/admin/places/${placeId}/recommendations`)
    if (res.ok) {
      const { data } = await res.json()
      setRecs(data ?? [])
    }
  }, [placeId])

  React.useEffect(() => {
    load()
  }, [load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!guideId || !quote.trim()) return
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/admin/places/${placeId}/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guide_id: guideId, quote: quote.trim() }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? "Failed to save recommendation.")
    } else {
      setQuote("")
      await load()
    }
    setBusy(false)
  }

  async function remove(recId: string) {
    setBusy(true)
    await fetch(`/api/admin/places/${placeId}/recommendations?rec=${recId}`, {
      method: "DELETE",
    })
    await load()
    setBusy(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guide recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No guide vouches for this place yet. A named quote is what separates a
            recommendation from a directory entry.
          </p>
        ) : (
          <ul className="space-y-3">
            {recs.map((rec) => (
              <li
                key={rec.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{rec.guides?.name ?? rec.guide_id}</p>
                  <p className="text-sm text-muted-foreground italic">“{rec.quote}”</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => remove(rec.id)}
                  className="text-destructive shrink-0"
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={add} className="space-y-3 border-t border-border pt-4">
          <div className="space-y-2">
            <Label htmlFor="rec-guide">Guide</Label>
            <select
              id="rec-guide"
              value={guideId}
              onChange={(e) => setGuideId(e.target.value)}
              className={selectClass}
            >
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rec-quote">Quote (the guide&apos;s own words)</Label>
            <Textarea
              id="rec-quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={2}
              placeholder="The tsukemen here is the best in the neighborhood — go before noon."
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="outline" size="sm" disabled={busy || !quote.trim()}>
            Add recommendation
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
