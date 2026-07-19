"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet, ArrowRight } from "lucide-react"
import type { ItemType } from "./Timeline"
import { participantInitial } from "./ParticipantChips"
import { computeBalances, simplifyDebts, type TripParticipant, type CostSplit } from "@/lib/budget/splitBalances"
import { BUDGET_CATEGORIES, categoryOf } from "@/lib/budget/categories"
import { formatCurrency, type Currency, type Rates } from "@/lib/currency/format"

interface BalancesModalProps {
  items: ItemType[]
  participants: TripParticipant[]
  splits: Map<string, CostSplit>
  currency: Currency
  rates: Rates
}

// "Who owes whom" panel: per-person net balances, a Splitwise-style simplified
// settle-up list, and a per-category cost breakdown of the whole trip.
export function BalancesModal({ items, participants, splits, currency, rates }: BalancesModalProps) {
  const fmt = (val: number) => formatCurrency(val, currency, rates)

  const participantById = useMemo(
    () => new Map(participants.map((p) => [p.id, p])),
    [participants]
  )

  const balances = useMemo(
    () => computeBalances(items, Array.from(splits.values()), participants)
      // Drop stale ids that survived a participant deletion inside old split
      // arrays — they can't be rendered and shouldn't be settled.
      .filter((b) => participantById.has(b.participantId)),
    [items, splits, participants, participantById]
  )

  const settlements = useMemo(() => simplifyDebts(balances), [balances])

  const hasAssignedCosts = useMemo(
    () => Array.from(splits.values()).some((s) => s.paidBy && s.splitBetween.length > 0),
    [splits]
  )

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>()
    for (const item of items) {
      if (!item.cost) continue
      const cat = categoryOf(item.type)
      totals.set(cat, (totals.get(cat) ?? 0) + item.cost)
    }
    const grand = Array.from(totals.values()).reduce((a, b) => a + b, 0)
    return { totals, grand }
  }, [items])

  const name = (id: string) => participantById.get(id)?.displayName ?? "?"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" title="Тооцоо">
          <Wallet className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Аяллын тооцоо</DialogTitle>
          <DialogDescription>
            Хэн юу төлснийг харж, аяллын төгсгөлд цөөн гүйлгээгээр тооцоогоо дуусга.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Per-person net balances */}
          {participants.length > 0 && hasAssignedCosts ? (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Хүн тус бүрийн үлдэгдэл
              </p>
              <div className="space-y-1.5">
                {balances.map((b) => {
                  const p = participantById.get(b.participantId)
                  return (
                    <div key={b.participantId} className="flex items-center gap-2 rounded-lg border p-2">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white shrink-0"
                        style={{ backgroundColor: p?.color ?? "#64748b" }}
                      >
                        {participantInitial(p?.displayName ?? "?")}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate">{p?.displayName}</span>
                      <span
                        className={`font-mono text-sm font-bold ${
                          b.net > 0 ? "text-emerald-600" : b.net < 0 ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {b.net > 0 ? "+" : ""}
                        {fmt(b.net)}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">
                + авах ёстой, − өгөх ёстой
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {participants.length === 0
                ? "Тооцоо хөтлөхийн тулд эхлээд аяллын оролцогчдоо нэмээрэй."
                : "Үйл ажиллагаа бүр дээр хэн төлснийг тэмдэглэвэл энд тооцоо гарна."}
            </p>
          )}

          {/* Simplified settle-up */}
          {settlements.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Тооцоо дуусгах
              </p>
              <div className="space-y-1.5">
                {settlements.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-muted/30 p-2 text-sm"
                  >
                    <span className="font-medium">{name(s.from)}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium flex-1">{name(s.to)}</span>
                    <span className="font-mono font-bold">{fmt(s.amountJpy)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-category breakdown (works even without participants) */}
          {categoryTotals.grand > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Зардлын задаргаа
              </p>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                {BUDGET_CATEGORIES.map((cat) => {
                  const val = categoryTotals.totals.get(cat.id) ?? 0
                  if (val === 0) return null
                  return (
                    <div
                      key={cat.id}
                      style={{
                        width: `${(val / categoryTotals.grand) * 100}%`,
                        backgroundColor: cat.color,
                      }}
                      title={`${cat.label}: ${fmt(val)}`}
                    />
                  )
                })}
              </div>
              <div className="space-y-1">
                {BUDGET_CATEGORIES.map((cat) => {
                  const val = categoryTotals.totals.get(cat.id) ?? 0
                  if (val === 0) return null
                  return (
                    <div key={cat.id} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="flex-1 text-muted-foreground">{cat.label}</span>
                      <span className="font-mono font-medium">{fmt(val)}</span>
                      <span className="w-10 text-right font-mono text-muted-foreground">
                        {Math.round((val / categoryTotals.grand) * 100)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
