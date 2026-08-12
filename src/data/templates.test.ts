import { describe, it, expect } from "vitest"
import { SAMPLE_ITINERARIES } from "./templates"

describe("every template", () => {
  it.each(SAMPLE_ITINERARIES.map((t) => [t.id, t] as const))(
    "%s keeps every dayOffset inside its duration",
    (_id, template) => {
      for (const activity of template.activities) {
        expect(activity.dayOffset).toBeGreaterThanOrEqual(0)
        expect(activity.dayOffset).toBeLessThanOrEqual(template.duration - 1)
      }
    }
  )

  it.each(SAMPLE_ITINERARIES.map((t) => [t.id, t] as const))(
    "%s has unique activity ids",
    (_id, template) => {
      const ids = template.activities.map((a) => a.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  )

  it("has globally unique template ids", () => {
    const ids = SAMPLE_ITINERARIES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// Cost reconciliation is deliberately scoped to golden-route, the itinerary the
// homepage banner advertises. The other three templates have basePrice values
// that do not match their item costs; repricing them is out of scope.
describe("golden-route (the homepage featured itinerary)", () => {
  const template = SAMPLE_ITINERARIES.find((t) => t.id === "golden-route")!

  it("exists", () => {
    expect(template).toBeDefined()
  })

  it("runs for 14 days", () => {
    expect(template.duration).toBe(14)
  })

  it("costs exactly the advertised basePrice", () => {
    const sum = template.activities.reduce((total, a) => total + a.cost, 0)
    expect(sum).toBe(template.basePrice)
  })

  it("advertises 285,000 yen", () => {
    expect(template.basePrice).toBe(285000)
  })

  it("has at least one activity on every day", () => {
    const covered = new Set(template.activities.map((a) => a.dayOffset))
    const missing = Array.from({ length: template.duration }, (_, i) => i).filter(
      (day) => !covered.has(day)
    )
    expect(missing).toEqual([])
  })

  it("gives every activity coordinates so the map renders", () => {
    for (const activity of template.activities) {
      expect(activity.lat).toBeTypeOf("number")
      expect(activity.lng).toBeTypeOf("number")
    }
  })

  it("gives every activity a note", () => {
    for (const activity of template.activities) {
      expect(activity.notes?.length ?? 0).toBeGreaterThan(0)
    }
  })
})
