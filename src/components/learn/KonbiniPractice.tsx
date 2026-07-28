"use client"

import React, { useRef, useState } from "react"
import { ShoppingBag } from "lucide-react"
import { KonbiniSimulator } from "./KonbiniSimulator"

/**
 * Konbini practice CTA (design doc, Screen 08): a dark banner that reveals the
 * interactive convenience-store role-play simulator below it on demand.
 */
export function KonbiniPractice() {
  const [open, setOpen] = useState(false)
  const simRef = useRef<HTMLDivElement>(null)

  function start() {
    setOpen(true)
    // let the simulator mount, then bring it into view
    requestAnimationFrame(() =>
      simRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    )
  }

  return (
    <div className="mx-auto max-w-content px-4 md:px-6">
      <div
        className="flex flex-col gap-5 rounded-card p-6 sm:flex-row sm:items-center sm:justify-between md:p-8"
        style={{ background: "#0F1B2A" }}
      >
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-well bg-white/[.06] text-saffron">
            <ShoppingBag className="size-6" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold text-white">Konbini дадлага</h3>
            <p className="mt-0.5 max-w-md text-sm text-white/60">
              Дэлгүүрт мөнгө төлөх дүр сценарийг дадлагажуулаарай — интерактив дасгал.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={start}
          className="shrink-0 rounded-pill bg-saffron px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-600"
        >
          Дадлага эхлүүлэх
        </button>
      </div>

      {open && (
        <div ref={simRef}>
          <KonbiniSimulator />
        </div>
      )}
    </div>
  )
}
