/**
 * Minimal markdown-ish renderer for `posts.body_md` (articles).
 * Handles headings, paragraphs, and unordered lists — enough for editorial
 * copy without pulling in a markdown dependency. Swap for a real renderer
 * when the content team needs links/images inline.
 */
export function PostBody({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)

  return (
    <div className="space-y-6 text-base leading-7 text-foreground/90">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="font-display text-2xl font-bold text-foreground pt-4">
              {block.slice(3)}
            </h2>
          )
        }
        if (block.startsWith("# ")) {
          return (
            <h2 key={i} className="font-display text-3xl font-bold text-foreground pt-4">
              {block.slice(2)}
            </h2>
          )
        }
        if (/^[-*] /m.test(block)) {
          const items = block.split("\n").filter((l) => /^[-*] /.test(l))
          return (
            <ul key={i} className="list-disc pl-6 space-y-2">
              {items.map((item, j) => (
                <li key={j}>{item.replace(/^[-*] /, "")}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{block}</p>
      })}
    </div>
  )
}
