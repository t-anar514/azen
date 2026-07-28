import type { PostRow } from "@/lib/supabase/types"

/**
 * Article model for the /blog/[slug] reading view.
 *
 * The design's right-hand "АГУУЛГА" rail is a table of contents that includes
 * more than the body's own headings — the quick answer at the top and the
 * guide tip near the bottom are TOC entries too. So the TOC can't be derived
 * from the markdown alone; it's assembled here from the whole post record and
 * the body is parsed into blocks that carry matching ids.
 */

export type CalloutTone = "warn" | "tip" | "note"

export type ArticleBlock =
  | { kind: "heading"; id: string; text: string }
  | { kind: "para"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "callout"; tone: CalloutTone; title: string | null; text: string }
  | { kind: "figure"; src: string | null; caption: string }

export interface TocEntry {
  id: string
  text: string
}

export interface Article {
  blocks: ArticleBlock[]
  toc: TocEntry[]
}

/** Fixed ids for the sections the page renders itself (not from body_md). */
export const QUICK_ANSWER_ID = "shuurhai-shiidel"
export const GUIDE_TIP_ID = "khotochiin-zovlogoo"
export const RELATED_ID = "kholbootoi-niitlel"

export const QUICK_ANSWER_LABEL = "Хамгийн хурдан шийдэл"
export const GUIDE_TIP_LABEL = "Хөтөчийн зөвлөгөө"
export const RELATED_LABEL = "Холбоотой нийтлэл"

/**
 * Heading → element id. Keeps Unicode letters so Cyrillic headings get a
 * readable anchor (`#wallet-deer-suica-nemekh`); browsers handle non-ASCII
 * fragments fine, they're just percent-encoded in the address bar. Falls back
 * to a positional id when a heading is punctuation-only.
 */
export function slugifyHeading(text: string, index: number): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
  return slug || `section-${index}`
}

const CALLOUT_OPEN = /^:::(warn|tip|note)[ \t]*(.*)$/
const FIGURE = /^!\[([^\]]*)\]\(([^)]*)\)$/

/**
 * Markdown-ish body parser. Handles the basics the blog has always supported
 * (headings / paragraphs / unordered lists) plus two authoring affordances the
 * design needs inline:
 *
 *   :::warn Заавал мэдэх        ![Зурагны тайлбар](https://…)
 *   Visa карт ажиллахгүй.
 *   :::
 *
 * Unterminated `:::` blocks are tolerated — everything to the end of the body
 * becomes the callout — so a half-written draft still renders.
 */
export function parseArticleBody(body: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = []
  const lines = body.replace(/\r\n/g, "\n").split("\n")

  let paragraph: string[] = []
  let list: string[] = []
  let headingCount = 0

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "para", text: paragraph.join(" ").trim() })
      paragraph = []
    }
  }
  const flushList = () => {
    if (list.length) {
      blocks.push({ kind: "list", items: list })
      list = []
    }
  }
  const flushAll = () => {
    flushParagraph()
    flushList()
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      flushAll()
      continue
    }

    const callout = CALLOUT_OPEN.exec(line)
    if (callout) {
      flushAll()
      const tone = callout[1] as CalloutTone
      const title = callout[2].trim() || null
      const inner: string[] = []
      i++
      while (i < lines.length && lines[i].trim() !== ":::") {
        inner.push(lines[i].trim())
        i++
      }
      blocks.push({
        kind: "callout",
        tone,
        title,
        text: inner.join(" ").trim(),
      })
      continue
    }

    const figure = FIGURE.exec(line)
    if (figure) {
      flushAll()
      blocks.push({
        kind: "figure",
        src: figure[2].trim() || null,
        caption: figure[1].trim(),
      })
      continue
    }

    const heading = /^#{1,3}\s+(.*)$/.exec(line)
    if (heading) {
      flushAll()
      const text = heading[1].trim()
      blocks.push({ kind: "heading", id: slugifyHeading(text, headingCount++), text })
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph()
      list.push(line.replace(/^[-*]\s+/, ""))
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushAll()
  return blocks
}

/**
 * Hack posts store their content as `steps` rather than `body_md`. Rendering
 * each step as heading + prose puts both post types through the same reading
 * view, and gives hacks a working table of contents for free.
 */
function blocksFromSteps(post: PostRow): ArticleBlock[] {
  const blocks: ArticleBlock[] = []
  post.steps.forEach((step, i) => {
    const text = step.title?.trim()
    if (text) blocks.push({ kind: "heading", id: slugifyHeading(text, i), text })
    if (step.text?.trim()) blocks.push({ kind: "para", text: step.text.trim() })
  })
  return blocks
}

export function buildArticle(post: PostRow, relatedCount: number): Article {
  const hasBody = Boolean(post.body_md?.trim())
  const blocks = hasBody
    ? parseArticleBody(post.body_md as string)
    : post.steps.length
      ? blocksFromSteps(post)
      : post.excerpt
        ? [{ kind: "para" as const, text: post.excerpt }]
        : []

  // `trap_alternative` is a column, so it carries no position within the body.
  // Authors who need it mid-article use an inline `:::warn` block; when they
  // haven't, append it so the warning still reaches the reader.
  const hasInlineWarn = blocks.some((b) => b.kind === "callout" && b.tone === "warn")
  if (post.trap_alternative?.trim() && !hasInlineWarn) {
    blocks.push({
      kind: "callout",
      tone: "warn",
      title: null,
      text: post.trap_alternative.trim(),
    })
  }

  const toc: TocEntry[] = []
  if (post.excerpt?.trim()) toc.push({ id: QUICK_ANSWER_ID, text: QUICK_ANSWER_LABEL })
  for (const block of blocks) {
    if (block.kind === "heading") toc.push({ id: block.id, text: block.text })
  }
  if (post.pro_tip?.trim()) toc.push({ id: GUIDE_TIP_ID, text: GUIDE_TIP_LABEL })
  if (relatedCount > 0) toc.push({ id: RELATED_ID, text: RELATED_LABEL })

  return { blocks, toc }
}
