import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Only these names are accepted. This endpoint is public (anonymous browsing
// is most of the funnel) and writes with the service role, so the allowlist
// plus the size caps below are what keep it from being an open write channel.
const ALLOWED_EVENTS = new Set([
  "city_hub_viewed",
  "place_viewed",
  "place_saved",
  "folder_created",
  "folder_added_to_trip",
  "guide_profile_viewed",
  "tour_request_submitted",
  "transfer_quote_requested",
  "booking_confirmed",
  "post_read",
])

const MAX_PROP_KEYS = 12
const MAX_VALUE_LEN = 200

function sanitizeProps(raw: unknown): Record<string, string | number | boolean> {
  if (!raw || typeof raw !== "object") return {}
  const out: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_PROP_KEYS) break
    if (typeof value === "number" || typeof value === "boolean") {
      out[key.slice(0, 40)] = value
    } else if (typeof value === "string") {
      out[key.slice(0, 40)] = value.slice(0, MAX_VALUE_LEN)
    }
  }
  return out
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const name = typeof body?.name === "string" ? body.name : null

  if (!name || !ALLOWED_EVENTS.has(name)) {
    // 204 rather than 4xx: a stale client shouldn't produce console noise
    return new NextResponse(null, { status: 204 })
  }

  // attribute to the signed-in user when there is one
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  await admin.from("analytics_events").insert({
    name,
    props: sanitizeProps(body.props),
    user_id: user?.id ?? null,
    session_id: typeof body.session_id === "string" ? body.session_id.slice(0, 64) : null,
    path: typeof body.path === "string" ? body.path.slice(0, 200) : null,
  })

  return new NextResponse(null, { status: 204 })
}
