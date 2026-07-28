"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

/**
 * "Шалгах" on the booking confirmation page.
 *
 * The page itself is a server component, so it cannot carry an onClick — and
 * the state it renders changes out-of-band, when the Wire webhook flips the
 * booking to `confirmed`. router.refresh() re-runs the server render in place,
 * which is what actually picks that up (window.location.reload() would too, but
 * only from a client component, and it throws away the whole document).
 */
export function RecheckButton() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      className="mt-6 inline-block rounded-thumb bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
    >
      {isPending ? "Шалгаж байна…" : "Шалгах"}
    </button>
  )
}
