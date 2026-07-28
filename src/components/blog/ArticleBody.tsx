import { ImageIcon } from "lucide-react"

import { ArticleCallout } from "@/components/blog/ArticleCallout"
import type { ArticleBlock } from "@/lib/blog/article"

/**
 * Renders the parsed article blocks. Headings carry the ids the TOC scroll-spy
 * observes, and `scroll-mt` keeps them clear of the sticky navbar when jumped to.
 */
export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading":
            return (
              <h2
                key={i}
                id={block.id}
                className="scroll-mt-28 pt-4 font-display text-[21px] font-extrabold tracking-tight text-foreground sm:text-[23px]"
              >
                {block.text}
              </h2>
            )

          case "para":
            return (
              <p key={i} className="text-[14.5px] leading-[1.75] text-foreground/80">
                {block.text}
              </p>
            )

          case "list":
            return (
              <ul key={i} className="space-y-2 pl-1">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-2.5 text-[14.5px] leading-[1.75] text-foreground/80"
                  >
                    <span
                      className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-saffron"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )

          case "callout":
            return (
              <ArticleCallout
                key={i}
                tone={block.tone}
                title={block.title}
                text={block.text}
                className="my-6"
              />
            )

          case "figure":
            return (
              <figure key={i} className="my-6 space-y-2">
                {block.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={block.src}
                    alt={block.caption}
                    className="w-full rounded-thumb object-cover"
                  />
                ) : (
                  <div
                    className="flex aspect-[16/9] items-center justify-center rounded-thumb bg-gradient-to-br from-sky-50 to-tint-lilac"
                    aria-hidden
                  >
                    <ImageIcon className="h-6 w-6 text-sky-200" />
                  </div>
                )}
                {block.caption && (
                  <figcaption className="text-xs text-muted-foreground">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )
        }
      })}
    </div>
  )
}
