/**
 * Absolute origin for the public site, used by the sitemap, robots.txt and
 * `metadataBase` (which turns relative OG/canonical URLs into absolute ones).
 *
 * Set `NEXT_PUBLIC_SITE_URL` per environment to override — on a Vercel preview
 * deployment, for instance, so its sitemap doesn't advertise production URLs.
 * The fallback is the production domain.
 *
 * Note: pick ONE canonical host and redirect the other. If both azen.tours and
 * www.azen.tours serve the site, search engines treat them as separate sites
 * and split the ranking between them.
 */
const FALLBACK_ORIGIN = "https://azen.tours"

function resolveOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, "")
  return FALLBACK_ORIGIN
}

export const SITE_URL = resolveOrigin()

/** Joins a root-relative path onto the site origin. `absoluteUrl("/blog")`. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
