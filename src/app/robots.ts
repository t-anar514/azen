import type { MetadataRoute } from "next"

import { absoluteUrl } from "@/lib/siteUrl"

/**
 * robots.txt. Everything public is crawlable; the disallow list is the set of
 * routes that are either auth-gated, per-user, or meaningless to a crawler.
 *
 * These are not a security boundary — `/admin` and `/driver` are already gated
 * in middleware.ts and `/account` by RLS. Listing them here just keeps private
 * URLs out of search results and stops crawl budget being spent on redirects.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/account",
          "/account/",
          "/driver",
          "/driver/",
          "/api/",
          "/auth/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          // Per-booking and per-trip pages: unguessable ids, nothing to index.
          "/transfer/confirmation/",
          "/transfer/trip/",
          "/transfer/history",
          "/planner/shared/",
          "/thanks",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}
