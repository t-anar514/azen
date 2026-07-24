"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, Pencil, Search, Star, Trash2, X } from "lucide-react"

import { cn, initials } from "@/lib/utils"
import type { GuideRow } from "@/lib/supabase/types"

/** A pending `guide_applications` row, flattened for display. */
export interface PendingApplication {
  id: string
  name: string
  location: string | null
  /** Best available descriptor — applications carry languages, not tags. */
  specialties: string
}

interface GuidesTableProps {
  guides: GuideRow[]
  applications: PendingApplication[]
}

type StatusFilter = "all" | "active" | "pending"

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Бүгд" },
  { value: "active", label: "Идэвхтэй" },
  { value: "pending", label: "Хүлээгдэж буй" },
]

// Deterministic avatar tint so every guide keeps the same colour between renders.
const AVATAR_TINTS = ["#1A4E8A", "#2E8B6F", "#B4508E", "#DE8C2E", "#3AA0A0", "#5F58AD"]

function tintFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_TINTS[hash % AVATAR_TINTS.length]
}

function Avatar({ name, image, className }: { name: string; image?: string | null; className?: string }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt={name} className={cn("size-9 shrink-0 rounded-full object-cover", className)} />
  ) : (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
        className
      )}
      style={{ background: tintFor(name) }}
    >
      {initials(name)}
    </span>
  )
}

export function GuidesTable({ guides, applications }: GuidesTableProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const q = query.trim().toLowerCase()
  const guideMatches = React.useCallback(
    (g: GuideRow) =>
      !q ||
      g.name.toLowerCase().includes(q) ||
      (g.location ?? "").toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q)),
    [q]
  )
  const appMatches = React.useCallback(
    (a: PendingApplication) =>
      !q ||
      a.name.toLowerCase().includes(q) ||
      (a.location ?? "").toLowerCase().includes(q) ||
      a.specialties.toLowerCase().includes(q),
    [q]
  )

  const visibleApps = React.useMemo(
    () => (status === "active" ? [] : applications.filter(appMatches)),
    [applications, status, appMatches]
  )
  const visibleGuides = React.useMemo(
    () =>
      guides.filter((g) => {
        if (status === "active" && !g.is_active) return false
        if (status === "pending" && g.is_active) return false
        return guideMatches(g)
      }),
    [guides, status, guideMatches]
  )

  const activeGuides = React.useMemo(
    () => guides.filter((g) => g.is_active && guideMatches(g)),
    [guides, guideMatches]
  )
  const inactiveGuides = React.useMemo(
    () => guides.filter((g) => !g.is_active && guideMatches(g)),
    [guides, guideMatches]
  )
  const pendingApps = React.useMemo(() => applications.filter(appMatches), [applications, appMatches])
  const approvalCount = pendingApps.length + inactiveGuides.length

  async function decideApplication(id: string, action: "approve" | "reject") {
    if (action === "reject" && !confirm("Энэ хүсэлтийг татгалзах уу?")) return
    setBusyId(id)
    await fetch(`/api/admin/guide-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    setBusyId(null)
    router.refresh()
  }

  async function activateGuide(id: string) {
    setBusyId(id)
    await fetch(`/api/admin/guides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: true }),
    })
    setBusyId(null)
    router.refresh()
  }

  async function deleteGuide(id: string, name: string) {
    if (!confirm(`"${name}" хөтчийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return
    setBusyId(id)
    await fetch(`/api/admin/guides/${id}`, { method: "DELETE" })
    setBusyId(null)
    router.refresh()
  }

  const activeStatusLabel = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "Бүгд"
  const nothingToShow = visibleApps.length === 0 && visibleGuides.length === 0

  return (
    <div className="space-y-5">
      {/* ── Toolbar (dark on mobile, light on desktop) ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40 md:text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Хөтөч хайх..."
            className="w-full rounded-pill border border-white/10 bg-white/[.06] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/25 focus:outline-none md:border-border md:bg-background md:text-foreground md:placeholder:text-muted-foreground md:focus:border-primary md:focus:ring-2 md:focus:ring-primary/20"
          />
        </div>

        {/* status filter drives the desktop table; mobile uses its own sections */}
        <div className="relative hidden shrink-0 md:block" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 rounded-pill border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            <span>
              Төлөв: <span className="font-semibold">{activeStatusLabel}</span>
            </span>
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", menuOpen && "rotate-180")} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-well border border-border bg-card p-1 shadow-lg">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setStatus(opt.value)
                    setMenuOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                    status === opt.value ? "font-semibold text-primary" : "text-foreground"
                  )}
                >
                  {opt.label}
                  {status === opt.value && <Check className="size-4" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ Mobile: dark approval queue + active list ══════════ */}
      <div className="space-y-6 md:hidden">
        {approvalCount > 0 && (
          <section className="rounded-[14px] border border-saffron/30 bg-saffron/[.12] p-3.5">
            <div className="mb-2.5 flex items-center gap-2">
              <h2 className="font-display text-[13.5px] font-bold text-white">Батлах хүсэлт</h2>
              <span className="rounded-pill bg-[#ECA64F] px-2 py-0.5 text-[10px] font-extrabold text-[#0C1826]">
                {approvalCount}
              </span>
            </div>

            <div className="space-y-3">
              {pendingApps.map((app) => (
                <div key={app.id} className="flex items-center gap-2.5">
                  <Avatar name={app.name} className="size-[34px]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold text-white">{app.name}</div>
                    <div className="truncate text-[11px] text-white/50">
                      {[app.location, app.specialties].filter(Boolean).join(" · ") || "Шинэ хүсэлт"}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === app.id}
                    onClick={() => decideApplication(app.id, "approve")}
                    aria-label={`${app.name}-г зөвшөөрөх`}
                    className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-success text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="size-[15px]" strokeWidth={2.6} />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === app.id}
                    onClick={() => decideApplication(app.id, "reject")}
                    aria-label={`${app.name}-г татгалзах`}
                    className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                  >
                    <X className="size-[14px]" strokeWidth={2.4} />
                  </button>
                </div>
              ))}

              {/* deactivated guides share the queue — activating is a one-tap fix */}
              {inactiveGuides.map((guide) => (
                <div key={guide.id} className="flex items-center gap-2.5">
                  <Avatar name={guide.name} image={guide.image} className="size-[34px]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold text-white">{guide.name}</div>
                    <div className="truncate text-[11px] text-white/50">
                      {[guide.location, guide.tags.slice(0, 2).join(", ")].filter(Boolean).join(" · ") ||
                        "Идэвхгүй"}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === guide.id}
                    onClick={() => activateGuide(guide.id)}
                    aria-label={`${guide.name}-г идэвхжүүлэх`}
                    className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-success text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="size-[15px]" strokeWidth={2.6} />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === guide.id}
                    onClick={() => deleteGuide(guide.id, guide.name)}
                    aria-label={`${guide.name}-г устгах`}
                    className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                  >
                    <X className="size-[14px]" strokeWidth={2.4} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 font-display text-[13.5px] font-bold text-white/85">Идэвхтэй хөтчүүд</h2>
          {activeGuides.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/50">
              Идэвхтэй хөтөч алга.
            </p>
          ) : (
            <div className="space-y-2.5">
              {activeGuides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/admin/guides/${guide.id}/edit`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-3 transition-colors hover:bg-white/[.08]"
                >
                  <Avatar name={guide.name} image={guide.image} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-white">{guide.name}</div>
                    <div className="truncate text-[11px] text-white/50">
                      {[guide.location, guide.tags[0]].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  {guide.review_count > 0 && (
                    <span className="flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-white">
                      <Star className="size-3.5 fill-saffron text-saffron" />
                      {guide.rating.toFixed(1)}
                    </span>
                  )}
                  <span className="shrink-0 rounded-pill bg-success/20 px-2.5 py-1 text-[10px] font-semibold text-[#5FD0A6]">
                    Идэвхтэй
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ══════════ Desktop: table (applications listed as pending rows) ══════════ */}
      <div className="hidden rounded-card border border-border bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-semibold">Хөтөч</th>
                <th className="px-6 py-3 font-semibold">Байршил</th>
                <th className="px-6 py-3 font-semibold">Мэргэшил</th>
                <th className="px-6 py-3 font-semibold">Үнэлгээ</th>
                <th className="px-6 py-3 font-semibold">Төлөв</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {nothingToShow ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Хөтөч олдсонгүй.
                  </td>
                </tr>
              ) : (
                <>
                  {visibleApps.map((app) => (
                    <tr key={app.id} className="border-t border-border transition-colors hover:bg-muted/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={app.name} />
                          <span className="font-semibold text-foreground">{app.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground/80">{app.location ?? "—"}</td>
                      <td className="px-6 py-4 text-foreground/80">{app.specialties || "—"}</td>
                      <td className="px-6 py-4 text-muted-foreground">—</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-saffron-50 px-3 py-1 text-xs font-semibold text-saffron-600">
                          Хүлээгдэж буй
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            disabled={busyId === app.id}
                            onClick={() => decideApplication(app.id, "approve")}
                            aria-label={`${app.name}-г зөвшөөрөх`}
                            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-success/10 hover:text-success disabled:opacity-50"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            type="button"
                            disabled={busyId === app.id}
                            onClick={() => decideApplication(app.id, "reject")}
                            aria-label={`${app.name}-г татгалзах`}
                            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visibleGuides.map((guide) => (
                    <tr key={guide.id} className="border-t border-border transition-colors hover:bg-muted/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={guide.name} image={guide.image} />
                          <span className="flex items-center gap-1.5 font-semibold text-foreground">
                            {guide.name}
                            {guide.is_verified && (
                              <Check className="size-3.5 text-primary" aria-label="Баталгаажсан" />
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground/80">{guide.location ?? "—"}</td>
                      <td className="px-6 py-4 text-foreground/80">
                        {guide.tags.length > 0 ? guide.tags.join(", ") : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {guide.review_count > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                            <Star className="size-4 fill-saffron text-saffron" />
                            {guide.rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {guide.is_active ? (
                          <span className="inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                            Идэвхтэй
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-saffron-50 px-3 py-1 text-xs font-semibold text-saffron-600">
                            Хүлээгдэж буй
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {!guide.is_active && (
                            <button
                              type="button"
                              disabled={busyId === guide.id}
                              onClick={() => activateGuide(guide.id)}
                              aria-label={`${guide.name}-г идэвхжүүлэх`}
                              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-success/10 hover:text-success disabled:opacity-50"
                            >
                              <Check className="size-4" />
                            </button>
                          )}
                          <Link
                            href={`/admin/guides/${guide.id}/edit`}
                            aria-label={`${guide.name}-г засах`}
                            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            type="button"
                            disabled={busyId === guide.id}
                            onClick={() => deleteGuide(guide.id, guide.name)}
                            aria-label={`${guide.name}-г устгах`}
                            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
