"use client"

import * as React from "react"
import { Check, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SHIFT_SLOTS,
  SLOT_IDS,
  WEEKDAYS,
  templateKey,
  type ShiftSlot,
} from "@/lib/drivers/shifts"

export interface TemplatePrefs {
  minNoticeHours: number
  maxJobsPerDay: number
  autoExtend: boolean
}

interface WeeklyTemplateEditorProps {
  /** "weekday:slot" keys that start switched on. */
  initialOpen: Set<string>
  initialPrefs: TemplatePrefs
  onSaved: (open: Set<string>) => void
}

const NOTICE_OPTIONS = [1, 2, 4, 8, 12, 24]
const MAX_JOB_OPTIONS = [1, 2, 3, 4, 5, 6, 8]

/**
 * The 7×3 grid the whole model rests on.
 *
 * Saving is debounced and optimistic rather than gated behind a Save button:
 * the grid is 21 toggles and a driver adjusting their week will hit several in
 * a row, so a button would either be pressed once at the end (and forgotten) or
 * turn every tap into a round-trip. The pending indicator in the header is what
 * replaces it.
 */
export function WeeklyTemplateEditor({
  initialOpen,
  initialPrefs,
  onSaved,
}: WeeklyTemplateEditorProps) {
  const [open, setOpen] = React.useState<Set<string>>(initialOpen)
  const [prefs, setPrefs] = React.useState<TemplatePrefs>(initialPrefs)
  const [state, setState] = React.useState<"idle" | "saving" | "saved" | "error">("idle")

  // Held in a ref so the debounced save always posts the latest grid without
  // the timer being torn down and restarted on every single toggle. Synced in
  // an effect rather than during render: a ref written while rendering is not
  // guaranteed to survive a discarded render pass.
  const latest = React.useRef({ open, prefs })
  React.useEffect(() => {
    latest.current = { open, prefs }
  }, [open, prefs])

  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const { open: currentOpen, prefs: currentPrefs } = latest.current
      setState("saving")

      const cells = Array.from(currentOpen).map((key) => {
        const [weekday, slot] = key.split(":")
        return { weekday: Number(weekday), slot: slot as ShiftSlot, capacity: 1 }
      })

      const res = await fetch("/api/driver/schedule/template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cells,
          minNoticeHours: currentPrefs.minNoticeHours,
          maxJobsPerDay: currentPrefs.maxJobsPerDay,
          autoExtend: currentPrefs.autoExtend,
        }),
      })

      if (!res.ok) {
        setState("error")
        return
      }
      setState("saved")
      onSaved(currentOpen)
    }, 700)
  }, [onSaved])

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  function toggle(weekday: number, slot: ShiftSlot) {
    setOpen((prev) => {
      const next = new Set(prev)
      const key = templateKey(weekday, slot)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    scheduleSave()
  }

  function setPref<K extends keyof TemplatePrefs>(key: K, value: TemplatePrefs[K]) {
    setPrefs((p) => ({ ...p, [key]: value }))
    scheduleSave()
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[15.5px] font-bold text-foreground">
            Долоо хоногийн загвар
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ажиллах ээлжээ сонго — цаашид автоматаар давтагдана
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {state === "saving" && (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-label="Хадгалж байна" />
          )}
          {state === "saved" && <Check className="size-3.5 text-success" aria-label="Хадгаллаа" />}
          {state === "error" && (
            <span className="text-[11px] font-semibold text-destructive">Хадгалагдсангүй</span>
          )}
          <span className="text-[12px] font-semibold text-muted-foreground">Давтах</span>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.autoExtend}
            aria-label="Хуваарь автоматаар үргэлжлэх"
            onClick={() => setPref("autoExtend", !prefs.autoExtend)}
            className={cn(
              "relative h-[22px] w-10 shrink-0 rounded-pill transition-colors",
              prefs.autoExtend ? "bg-success" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute top-[3px] size-4 rounded-full bg-white shadow transition-all",
                prefs.autoExtend ? "left-[21px]" : "left-[3px]"
              )}
            />
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          <div className="mb-1.5 grid grid-cols-[44px_repeat(3,1fr)] gap-2">
            <span />
            {SHIFT_SLOTS.map((slot) => (
              <div key={slot.id} className="text-center">
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {slot.label}
                </div>
                <div className="text-[10.5px] text-muted-foreground/70">{slot.shortRange}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            {WEEKDAYS.map((day) => (
              <div key={day.iso} className="grid grid-cols-[44px_repeat(3,1fr)] items-center gap-2">
                <span className="text-[12.5px] font-bold text-muted-foreground">{day.short}</span>
                {SLOT_IDS.map((slot) => {
                  const on = open.has(templateKey(day.iso, slot))
                  return (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={on}
                      aria-label={`${day.long} ${slot} ${on ? "нээлттэй" : "хаалттай"}`}
                      onClick={() => toggle(day.iso, slot)}
                      className={cn(
                        "h-8 rounded-[9px] text-[12px] font-bold transition-colors",
                        on
                          ? "bg-primary text-primary-foreground hover:bg-sky-900"
                          : "bg-muted text-muted-foreground hover:bg-border"
                      )}
                    >
                      {on ? "Нээлттэй" : "Хаалттай"}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11.5px] font-semibold text-muted-foreground">
            Хамгийн эрт захиалга
          </span>
          <select
            value={prefs.minNoticeHours}
            onChange={(e) => setPref("minNoticeHours", Number(e.target.value))}
            className="mt-1 w-full rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {NOTICE_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h} цагийн өмнө
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11.5px] font-semibold text-muted-foreground">
            Өдөрт дээд тал нь
          </span>
          <select
            value={prefs.maxJobsPerDay}
            onChange={(e) => setPref("maxJobsPerDay", Number(e.target.value))}
            className="mt-1 w-full rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {MAX_JOB_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} ажил
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
