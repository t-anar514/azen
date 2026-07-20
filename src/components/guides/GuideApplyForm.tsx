"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const LANGUAGES = ["Монгол", "Япон", "Англи", "Орос", "Хятад", "Солонгос"]

export function GuideApplyForm({ cities }: { cities: { id: string; name: string }[] }) {
  const [languages, setLanguages] = React.useState<string[]>(["Монгол"])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  function toggleLanguage(lang: string) {
    setLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]))
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/guides/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.get("full_name"),
          email: form.get("email"),
          phone: form.get("phone"),
          city_id: form.get("city_id"),
          bio: form.get("bio"),
          motivation: form.get("motivation"),
          languages,
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error ?? "Илгээж чадсангүй.")
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.")
    }
    setBusy(false)
  }

  if (done) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-4 p-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-tint-sage">
            <Check className="size-6 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold">Хүсэлт хүлээн авлаа</h2>
          <p className="text-muted-foreground">
            Бид таны мэдээллийг хянаад холбогдоно. Ихэвчлэн 3–5 хоног зарцуулдаг.
          </p>
          <Button asChild variant="outline" className="rounded-pill">
            <Link href="/">Нүүр хуудас руу</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Нэр *</Label>
              <Input id="full_name" name="full_name" className="rounded-pill" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Имэйл *</Label>
              <Input id="email" name="email" type="email" className="rounded-pill" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Утас</Label>
              <Input id="phone" name="phone" className="rounded-pill" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city_id">Аль хотод?</Label>
              <select
                id="city_id"
                name="city_id"
                className="h-9 w-full rounded-pill border border-input bg-card px-4 text-sm outline-none"
              >
                <option value="">—</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ямар хэлээр ярьдаг вэ?</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={cn(
                    "rounded-pill border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                    languages.includes(lang)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Товч танилцуулга</Label>
            <Textarea id="bio" name="bio" rows={3} placeholder="Хэдэн жил амьдарч байна вэ? Юугаараа онцлог вэ?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Яагаад хөтөч болохыг хүсэж байна вэ?</Label>
            <Textarea id="motivation" name="motivation" rows={3} />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="reserve" className="rounded-pill w-full" disabled={busy}>
        {busy ? "Илгээж байна…" : "Хүсэлт илгээх"}
      </Button>
    </form>
  )
}
