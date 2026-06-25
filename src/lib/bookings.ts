import "server-only"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { BookingRow } from "@/lib/supabase/types"

/**
 * Fetches a booking by id for "viewer" contexts (the confirmation/trip pages,
 * GET /api/bookings/[id]). Tries the normal session-bound client first, so
 * RLS naturally scopes the result to the owning user, the assigned driver,
 * or an admin. If that returns nothing — most commonly because the booking
 * was a *guest* checkout with no user_id attached — falls back to a
 * service-role lookup.
 *
 * This intentionally treats the booking's own `id` (a random, unguessable
 * uuid) as a bearer token for guest access — the same pattern Stripe payment
 * links and most booking-confirmation emails use. It's a deliberate
 * simplification for the MVP: anyone with the link can *view* that one
 * booking, but RLS still blocks anyone but the owner/driver/admin from
 * writing to it.
 */
export async function getBookingForViewer(id: string): Promise<BookingRow | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle()
  if (data) return data as BookingRow

  const admin = createAdminClient()
  const { data: guestData } = await admin.from("bookings").select("*").eq("id", id).maybeSingle()
  return (guestData as BookingRow) ?? null
}

// Short, human-readable code shown to the customer ("Trip code: AZ-7K2P9Q")
// alongside the real booking id (used internally as the access link).
export function generateTripCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/1/I to avoid confusion
  let code = ""
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `AZ-${code}`
}

// Minimal, read-only contact info for the driver assigned to a booking —
// deliberately exposed to the customer (via service role, bypassing the
// drivers table's normal owner/admin-only RLS) so they know who's picking
// them up, without leaking license/vehicle document URLs.
export async function getDriverContactInfo(
  driverId: string
): Promise<{ full_name: string; phone: string } | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("drivers")
    .select("full_name, phone")
    .eq("id", driverId)
    .maybeSingle()
  return data ?? null
}

export const BOOKING_STATUS_ORDER: BookingRow["status"][] = [
  "pending_payment",
  "confirmed",
  "assigned",
  "en_route",
  "arrived",
  "picked_up",
  "completed",
]

export const BOOKING_STATUS_LABELS: Record<BookingRow["status"], string> = {
  pending_payment: "Төлбөр хүлээгдэж байна",
  confirmed: "Баталгаажсан",
  assigned: "Жолооч томилогдсон",
  en_route: "Жолооч явж байна",
  arrived: "Жолооч ирсэн",
  picked_up: "Авсан",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
}
