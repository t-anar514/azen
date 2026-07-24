/**
 * Month-by-month earnings bars (Орлого). Pure presentation — the page passes
 * the already-bucketed rows from `earningsByMonth`. Each bar is proportional
 * to the largest month so a guide can eyeball their best months at a glance.
 */
export function EarningsBreakdown({ months }: { months: { month: string; total: number }[] }) {
  if (months.length === 0) {
    return (
      <p className="rounded-card border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
        Дууссан аялал одоогоор алга — орлого дуусгасан захиалгаас бүрдэнэ.
      </p>
    )
  }

  const max = Math.max(...months.map((m) => m.total), 1)
  // newest month first
  const ordered = [...months].reverse()

  return (
    <div className="space-y-3.5 rounded-card border border-border bg-card p-5">
      {ordered.map((m) => (
        <div key={m.month} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
            {formatMonth(m.month)}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-success to-saffron"
              style={{ width: `${Math.max(4, Math.round((m.total / max) * 100))}%` }}
            />
          </div>
          <span className="w-24 shrink-0 text-right text-sm font-bold tabular-nums text-foreground">
            ¥{m.total.toLocaleString("mn-MN")}
          </span>
        </div>
      ))}
    </div>
  )
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-")
  return `${year} оны ${Number(month)}-р сар`
}
