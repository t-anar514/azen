import { describe, it, expect } from "vitest"
import { computeBalances, simplifyDebts, type CostSplit, type TripParticipant } from "./splitBalances"

const people: TripParticipant[] = [
  { id: "a", displayName: "Anar" },
  { id: "b", displayName: "Bat" },
  { id: "c", displayName: "Sarah" },
]

describe("computeBalances", () => {
  it("splits one item evenly across three people", () => {
    const items = [{ id: "hotel", cost: 30000 }]
    const splits: CostSplit[] = [{ itemId: "hotel", paidBy: "a", splitBetween: ["a", "b", "c"] }]
    const balances = computeBalances(items, splits, people)
    expect(balances).toEqual([
      { participantId: "a", net: 20000 },
      { participantId: "b", net: -10000 },
      { participantId: "c", net: -10000 },
    ])
  })

  it("handles uneven multi-item splits (hand-worked 3-person example)", () => {
    // hotel ¥25,000 paid by A, split A/B/C  → each owes 8,333.33
    // dinner ¥6,000 paid by B, split B/C    → each owes 3,000
    // taxi  ¥3,000 paid by C, split A/B/C   → each owes 1,000
    const items = [
      { id: "hotel", cost: 25000 },
      { id: "dinner", cost: 6000 },
      { id: "taxi", cost: 3000 },
    ]
    const splits: CostSplit[] = [
      { itemId: "hotel", paidBy: "a", splitBetween: ["a", "b", "c"] },
      { itemId: "dinner", paidBy: "b", splitBetween: ["b", "c"] },
      { itemId: "taxi", paidBy: "c", splitBetween: ["a", "b", "c"] },
    ]
    const balances = computeBalances(items, splits, people)
    // A: +25000 − 8333.33 − 1000 = +15666.67 → 15667
    // B: −8333.33 + 6000 − 3000 − 1000 = −6333.33 → −6333
    // C: −8333.33 − 3000 + 3000 − 1000 = −9333.33 → −9333
    expect(balances).toEqual([
      { participantId: "a", net: 15667 },
      { participantId: "b", net: -6333 },
      { participantId: "c", net: -9333 },
    ])
  })

  it("ignores items with no split row, zero cost, no payer, or empty split", () => {
    const items = [
      { id: "unassigned", cost: 9999 },
      { id: "free", cost: 0 },
      { id: "orphan-payer", cost: 5000 },
      { id: "empty-split", cost: 5000 },
    ]
    const splits: CostSplit[] = [
      { itemId: "free", paidBy: "a", splitBetween: ["a", "b"] },
      { itemId: "orphan-payer", paidBy: null, splitBetween: ["a", "b"] },
      { itemId: "empty-split", paidBy: "a", splitBetween: [] },
    ]
    const balances = computeBalances(items, splits, people)
    expect(balances).toEqual([
      { participantId: "a", net: 0 },
      { participantId: "b", net: 0 },
      { participantId: "c", net: 0 },
    ])
  })
})

describe("simplifyDebts", () => {
  it("returns no settlements when everyone is even", () => {
    expect(simplifyDebts([
      { participantId: "a", net: 0 },
      { participantId: "b", net: 0 },
    ])).toEqual([])
  })

  it("settles one creditor against two debtors, biggest first", () => {
    const settlements = simplifyDebts([
      { participantId: "a", net: 15667 },
      { participantId: "b", net: -6333 },
      { participantId: "c", net: -9333 },
    ])
    expect(settlements).toEqual([
      { from: "c", to: "a", amountJpy: 9333 },
      { from: "b", to: "a", amountJpy: 6333 },
    ])
  })

  it("chains multiple creditors and debtors without inventing money", () => {
    const balances = [
      { participantId: "a", net: 7000 },
      { participantId: "b", net: 3000 },
      { participantId: "c", net: -4000 },
      { participantId: "d", net: -6000 },
    ]
    const settlements = simplifyDebts(balances)
    // Every settlement moves a positive amount…
    for (const s of settlements) expect(s.amountJpy).toBeGreaterThan(0)
    // …each debtor pays out exactly what they owed…
    const paidBy = (id: string) =>
      settlements.filter((s) => s.from === id).reduce((sum, s) => sum + s.amountJpy, 0)
    expect(paidBy("c")).toBe(4000)
    expect(paidBy("d")).toBe(6000)
    // …and each creditor receives exactly what they were owed.
    const receivedBy = (id: string) =>
      settlements.filter((s) => s.to === id).reduce((sum, s) => sum + s.amountJpy, 0)
    expect(receivedBy("a")).toBe(7000)
    expect(receivedBy("b")).toBe(3000)
  })
})
