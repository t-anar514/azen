"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

/** Trip code with copy-to-clipboard — the reference support asks for. */
export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      // clipboard blocked — the code is on screen to read anyway
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Код хуулагдлаа" : "Аяллын кодыг хуулах"}
      className="flex items-center gap-2 rounded-pill border border-border bg-card px-3 py-1.5 transition-colors hover:bg-muted"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Аяллын код
      </span>
      <span className="font-mono text-[12.5px] font-bold text-foreground">{code}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  )
}
