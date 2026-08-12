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
