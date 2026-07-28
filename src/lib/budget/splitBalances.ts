// Who-paid / who-owes math for the planner's group budget splitting.
// Pure functions, no I/O — computed client-side because the item count per
// trip is small (tens, not thousands), so a jsonb-array SQL view isn't worth
// the complexity. All amounts are JPY (the storage currency); convert for
// display only, with lib/currency/format.

// Structurally satisfied by the planner's ItemType — kept narrow so this lib
// doesn't depend on UI component types.
export interface SplittableItem {
  id: string
  cost: number
}

export interface TripParticipant {
  id: string
  displayName: string
  color?: string
  // Linked Azen account, when this participant is a real user (the trip owner
  // or an accepted collaborator — kept in sync by the 0018 triggers). Ghost
  // participants (a name the owner typed) have no userId.
  userId?: string | null
}

export interface CostSplit {
  itemId: string
  // Nullable because item_cost_splits.paid_by nulls out when a participant is
  // deleted — an item with no known payer is excluded from the math entirely.
  paidBy: string | null
  splitBetween: string[]
}

export interface Balance {
  participantId: string
  net: number // +net = owed money, -net = owes money (JPY)
}

export interface Settlement {
  from: string
  to: string
  amountJpy: number
}

export function computeBalances(
  items: SplittableItem[],
  splits: CostSplit[],
  participants: TripParticipant[]
): Balance[] {
  const net = new Map(participants.map((p) => [p.id, 0]))
  const splitByItem = new Map(splits.map((s) => [s.itemId, s]))
  for (const item of items) {
    const split = splitByItem.get(item.id)
    if (!split || !item.cost || !split.paidBy || split.splitBetween.length === 0) continue
    const share = item.cost / split.splitBetween.length
    for (const participantId of split.splitBetween) {
      net.set(participantId, (net.get(participantId) ?? 0) - share)
    }
    net.set(split.paidBy, (net.get(split.paidBy) ?? 0) + item.cost)
  }
  return Array.from(net, ([participantId, amount]) => ({ participantId, net: Math.round(amount) }))
}

// Greedy debt simplification (standard Splitwise-style settle-up): match the
// biggest creditor against the biggest debtor repeatedly, instead of showing
// a full N×N "who owes whom for what" matrix.
export function simplifyDebts(balances: Balance[]): Settlement[] {
  const creditors = balances.filter((b) => b.net > 0).map((b) => ({ ...b })).sort((a, b) => b.net - a.net)
  const debtors = balances.filter((b) => b.net < 0).map((b) => ({ ...b, net: -b.net })).sort((a, b) => b.net - a.net)
  const settlements: Settlement[] = []
  let i = 0
  let j = 0
  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].net, debtors[j].net)
    if (amount > 0) {
      settlements.push({ from: debtors[j].participantId, to: creditors[i].participantId, amountJpy: amount })
    }
    creditors[i].net -= amount
    debtors[j].net -= amount
    if (creditors[i].net === 0) i++
    if (debtors[j].net === 0) j++
  }
  return settlements
}
