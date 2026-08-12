import { notFound } from "next/navigation"

/**
 * Catch-all that turns any unmatched URL into a proper 404.
 *
 * Without this, a URL matching no route never enters the `[locale]` segment at
 * all, so `[locale]/not-found.tsx` never runs and Next falls back to its own
 * bare "404: This page could not be found" screen. Routing it through here
 * means unmatched URLs get the branded 404 that `notFound()` calls already got.
 *
 * Next matches catch-all segments last, so this cannot shadow a real route.
 */
export default function CatchAllNotFound() {
  notFound()
}
