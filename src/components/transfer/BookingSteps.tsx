"use client"

import { Check, Pencil } from "lucide-react"

import { cn } from "@/lib/utils"

export type BookingStep = 1 | 2 | 3

export const STEP_LABELS: Record<BookingStep, string> = {
  1: "Чиглэл",
  2: "Огноо ба ээлж",
  3: "Төлбөр",
}

export const STEPS: BookingStep[] = [1, 2, 3]

interface StepRailProps {
  current: BookingStep
  /** Furthest step the traveler has legitimately reached. */
  reached: BookingStep
  onJump: (step: BookingStep) => void
}

/**
 * The 1–2–3 rail.
 *
 * Only steps already *reached* are clickable, and it is a jump backwards, not a
 * shortcut forwards: the guard that stops someone landing on "Төлбөр" without a
 * slot lives in the parent's `canAdvance`, and letting the rail bypass it would
 * put them on a payment step for a booking that cannot be created.
 *
 * Completed steps show a tick rather than their number. That is the difference
 * between "step 1 of 3" and "step 1 is done" — on a three-step form the second
 * is the thing worth knowing.
 */
export function StepRail({ current, reached, onJump }: StepRailProps) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const done = step < current
        const active = step === current
        const clickable = step <= reached && step !== current

        return (
          <li key={step} className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!clickable}
              aria-current={active ? "step" : undefined}
              onClick={() => clickable && onJump(step)}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-pill px-1 py-1 text-[13px] transition-colors",
                clickable && "cursor-pointer hover:text-foreground",
                active ? "font-bold text-primary" : done ? "text-success" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[11.5px] font-extrabold",
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : step}
              </span>
              <span className="truncate">{STEP_LABELS[step]}</span>
            </button>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn("h-px flex-1", step < current ? "bg-success/40" : "bg-border")}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

interface RouteRecapProps {
  route: string
  detail: string
  price: string
  onEdit: () => void
}

/**
 * The banner carried into steps 2 and 3 — what was chosen in step 1, and the
 * price it implies.
 *
 * It exists because the fields that produced it are no longer on screen, and a
 * fixed quote the traveler cannot re-read is a fixed quote they will not trust.
 * "Засах" goes back rather than opening an inline editor, so there is only one
 * place any given field can be changed.
 */
export function RouteRecap({ route, detail, price, onEdit }: RouteRecapProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-well border border-border bg-muted/40 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[15px] font-bold text-foreground">{route}</div>
        <div className="truncate text-[12px] text-muted-foreground">{detail}</div>
      </div>
      <div className="text-right">
        <div className="font-display text-[15px] font-extrabold text-foreground">{price}</div>
        <div className="text-[11px] text-muted-foreground">тогтмол үнэ</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex shrink-0 items-center gap-1 text-[12.5px] font-bold text-primary hover:underline"
      >
        <Pencil className="size-3.5" /> Засах
      </button>
    </div>
  )
}
