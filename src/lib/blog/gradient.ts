/**
 * Deterministic cover fallback for posts with no `cover_image`.
 *
 * Lives here rather than in BlogIndex because that module is `"use client"` —
 * server components (the article page, RelatedPosts) can't call a function
 * exported from a client module, and the failure only shows up on posts that
 * actually lack a cover.
 */
const POST_GRADIENTS = [
  "linear-gradient(160deg,#0F3B6B,#2D7DD2)",
  "linear-gradient(160deg,#14532D,#2E8B6F)",
  "linear-gradient(160deg,#C9761E,#DE8C2E)",
  "linear-gradient(160deg,#3B1D5F,#5F58AD)",
  "linear-gradient(160deg,#7A2E2E,#C2483B)",
]

export function postGradient(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return POST_GRADIENTS[h % POST_GRADIENTS.length]
}
