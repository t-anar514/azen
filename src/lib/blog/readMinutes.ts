interface ReadMinutesInput {
  summary?: string | null
  excerpt?: string | null
  body_md?: string | null
  pro_tip?: string | null
  steps?: Array<{ title?: string; text?: string }> | null
}

// ~200 words/minute, minimum 1 minute
export function readMinutes(input: ReadMinutesInput): number {
  const parts = [
    input.summary ?? input.excerpt ?? "",
    input.body_md ?? "",
    input.pro_tip ?? "",
    ...(input.steps ?? []).map((s) => `${s.title ?? ""} ${s.text ?? ""}`),
  ]
  const wordCount = parts.join(" ").split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}
