import { describe, it, expect } from "vitest"
import { profileCompleteness } from "./completeness"
import type { GuideRow } from "@/lib/supabase/types"

const base = {
  id: "g", legacy_id: null, profile_id: "p", name: "A", location: "Kyoto",
  tags: ["a", "b", "c"], rating: 5, review_count: 0, price: 3500,
  bio: "x".repeat(60), is_verified: true, is_active: true,
  image: "http://img", image_public_id: null, video_url: null,
  slug: "a", cover_image: "http://cover", created_at: "", updated_at: "",
} as GuideRow

describe("profileCompleteness", () => {
  it("is 100% when every item is satisfied", () => {
    const g = { ...base, video_url: "http://v" }
    expect(profileCompleteness(g, 10).pct).toBe(100)
  })
  it("drops proportionally when items are missing", () => {
    // missing video + only 2 recs → 4/6 done → 67
    const r = profileCompleteness({ ...base }, 2)
    expect(r.pct).toBe(67)
    expect(r.items.find(i => i.key === "video")!.done).toBe(false)
    expect(r.items.find(i => i.key === "recs")!.done).toBe(false)
  })
})
