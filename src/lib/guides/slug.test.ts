import { describe, it, expect } from "vitest"
import { guideSlug } from "./slug"

describe("guideSlug", () => {
  it("kebab-cases a name", () => {
    expect(guideSlug("Anar Tamir")).toBe("anar-tamir")
  })
  it("strips punctuation and collapses separators", () => {
    expect(guideSlug("  Bat-Erdene  O'Brien! ")).toBe("bat-erdene-o-brien")
  })
  it("falls back for empty/non-latin input", () => {
    expect(guideSlug("バット")).toBe("guide")
    expect(guideSlug("   ")).toBe("guide")
  })
  it("de-dupes against existing slugs with -2, -3…", () => {
    const existing = new Set(["anar-tamir", "anar-tamir-2"])
    expect(guideSlug("Anar Tamir", existing)).toBe("anar-tamir-3")
  })
})
