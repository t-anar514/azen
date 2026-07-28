"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, FileWarning, Info, X } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn, initials } from "@/lib/utils"
import type { DriverRow } from "@/lib/supabase/types"

interface DriverReviewPanelProps {
  driver: DriverRow | null
  onClose: () => void
}

const DOCUMENTS = [
  { key: "id_document_url", label: "Иргэний" },
  { key: "license_document_url", label: "Жолооны" },
  { key: "vehicle_document_url", label: "Тээврийн гэрчилгээ" },
] as const

function formatApplied(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}`
}

/**
 * The "Шалгах" side panel.
 *
 * Documents are shown as tiles rather than the row of text links the old page
 * had. An admin approving a driver is checking three specific things exist and
 * look right; three links that all say "doc" make them open every one to find
 * out which is missing, which is why the missing one is called out by name here
 * instead of just being absent.
 */
export function DriverReviewPanel({ driver, onClose }: DriverReviewPanelProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function decide(verification_status: "approved" | "rejected") {
    if (!driver) return
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/admin/drivers/${driver.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verification_status }),
    })
    setBusy(false)
    if (!res.ok) {
      setError("Хадгалж чадсангүй. Дахин оролдоно уу.")
      return
    }
    onClose()
    router.refresh()
  }

  const missing = driver
    ? DOCUMENTS.filter((d) => !driver[d.key]).map((d) => d.label)
    : []

  return (
    <Sheet open={driver !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {driver && (
          <>
            <SheetHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-saffron-50 font-display text-sm font-extrabold text-saffron-600">
                  {initials(driver.full_name)}
                </span>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-base">{driver.full_name}</SheetTitle>
                  <SheetDescription className="text-[12px]">
                    Өргөдөл · {formatApplied(driver.created_at)} · {driver.phone}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-5 p-4">
              <section>
                <h3 className="text-eyebrow mb-2 text-[11px]">Бичиг баримт</h3>
                <div className="grid grid-cols-3 gap-2">
                  {DOCUMENTS.map((doc) => {
                    const url = driver[doc.key]
                    return url ? (
                      <a
                        key={doc.key}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex aspect-[4/5] flex-col overflow-hidden rounded-well border border-border bg-muted transition-colors hover:border-primary"
                      >
                        <span className="flex-1 bg-gradient-to-br from-muted to-border" />
                        <span className="flex items-center gap-1 bg-card px-2 py-1.5 text-[11px] font-semibold text-success">
                          <Check className="size-3 shrink-0" strokeWidth={3} />
                          {doc.label}
                        </span>
                      </a>
                    ) : (
                      <div
                        key={doc.key}
                        className="flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-well border border-dashed border-destructive/40 bg-destructive/5 p-2 text-center"
                      >
                        <FileWarning className="size-4 text-destructive" />
                        <span className="text-[11px] font-bold leading-tight text-destructive">
                          {doc.label} дутуу
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-2">
                <div className="rounded-well border border-border p-3">
                  <div className="text-[11px] text-muted-foreground">Машин</div>
                  <div className="mt-0.5 text-[13px] font-bold text-foreground">
                    {driver.vehicle_make} {driver.vehicle_model}
                  </div>
                </div>
                <div className="rounded-well border border-border p-3">
                  <div className="text-[11px] text-muted-foreground">Улсын дугаар</div>
                  <div className="mt-0.5 text-[13px] font-bold text-foreground">
                    {driver.vehicle_plate}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Үнэмлэх {driver.license_number}
                  </div>
                </div>
              </section>

              <p className="flex gap-2 rounded-well bg-secondary p-3 text-[12.5px] leading-relaxed text-primary">
                <Info className="mt-0.5 size-4 shrink-0" />
                <span>
                  Батласнаар <b>жолооч</b> эрх нээгдэж, <b>/studio</b> хуваарийн самбар
                  идэвхжинэ. Хуваарь нээх хүртэл аялагчид харагдахгүй.
                </span>
              </p>

              {missing.length > 0 && (
                <p className="text-[12px] font-semibold text-destructive">
                  Дутуу: {missing.join(", ")}
                </p>
              )}
              {error && <p className="text-[12px] font-semibold text-destructive">{error}</p>}
            </div>

            <div className="sticky bottom-0 mt-auto flex gap-2 border-t border-border bg-card p-4">
              <Button
                className="flex-1"
                disabled={busy}
                onClick={() => decide("approved")}
              >
                <Check className="size-4" /> Батлах
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                className={cn("text-destructive hover:text-destructive")}
                onClick={() => decide("rejected")}
              >
                <X className="size-4" /> Татгалзах
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
