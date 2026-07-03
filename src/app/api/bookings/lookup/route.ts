import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Guest booking recovery for people who checked out without an account and
// lost their confirmation link. Deliberately narrow: matching a trip_code
// ALONE is not enough (a 6-char human-typeable code has real collision/guess
// surface), so the request must also match the guest_email or guest_phone on
// that booking. On success we hand back the booking id — the same unguessable
// bearer token the confirmation link uses — so the client can redirect to the
// existing /transfer/trip/[id] tracking page.
//
// Uses the service-role client because guest bookings have user_id = null and
// so aren't reachable through RLS by trip_code; the contact match is what
// authorizes the lookup, not the session.

// Best-effort per-instance rate limit. This is a lookup-by-guess surface, so
// throttle it. (In-memory only — resets on redeploy and isn't shared across
// serverless instances; good enough for the MVP, swap for a shared store if
// this ever needs to be airtight.)
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60 * 60 * 1000
const MAX_ATTEMPTS = 8

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "")
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const now = Date.now()
  const rec = attempts.get(ip)
  if (rec && rec.resetAt > now) {
    if (rec.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Хэт олон оролдлого хийсэн байна. Хэсэг хугацааны дараа дахин оролдоно уу." },
        { status: 429 }
      )
    }
    rec.count++
  } else {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  }

  const body = await request.json().catch(() => null)
  const tripCodeRaw = typeof body?.trip_code === "string" ? body.trip_code.trim().toUpperCase() : ""
  const contact = typeof body?.contact === "string" ? body.contact.trim() : ""

  if (!tripCodeRaw || !contact) {
    return NextResponse.json({ error: "Аяллын код болон холбоо барих мэдээлэл шаардлагатай." }, { status: 400 })
  }

  // Accept the code with or without the "AZ-" prefix the customer sees.
  const tripCode = tripCodeRaw.startsWith("AZ-") ? tripCodeRaw : `AZ-${tripCodeRaw}`

  const admin = createAdminClient()
  const { data } = await admin
    .from("bookings")
    .select("id, guest_email, guest_phone")
    .eq("trip_code", tripCode)
    .maybeSingle()

  const contactLower = contact.toLowerCase()
  const matches =
    data &&
    ((data.guest_email && data.guest_email.toLowerCase() === contactLower) ||
      (data.guest_phone && normalizePhone(data.guest_phone) === normalizePhone(contact)))

  if (!matches) {
    // Generic failure — never reveal whether the code existed or which field
    // was wrong.
    return NextResponse.json({ error: "Ийм мэдээлэлтэй захиалга олдсонгүй." }, { status: 404 })
  }

  return NextResponse.json({ data: { id: data.id } })
}
