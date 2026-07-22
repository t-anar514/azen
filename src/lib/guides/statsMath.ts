export function weekDeltaPct(thisWeek: number, lastWeek: number): number {
  if (lastWeek === 0) return thisWeek === 0 ? 0 : 100
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
}

export function sumCompleted(bookings: { amount: number; status: string }[]): number {
  return bookings
    .filter(b => b.status === "completed")
    .reduce((s, b) => s + Number(b.amount), 0)
}

export function earningsByMonth(
  bookings: { amount: number; status: string; trip_date: string }[]
): { month: string; total: number }[] {
  const map = new Map<string, number>()
  for (const b of bookings) {
    if (b.status !== "completed") continue
    const month = b.trip_date.slice(0, 7)
    map.set(month, (map.get(month) ?? 0) + Number(b.amount))
  }
  return [...map.entries()].sort(([a], [c]) => a.localeCompare(c))
    .map(([month, total]) => ({ month, total }))
}
