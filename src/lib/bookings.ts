import "server-only"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isDriverRevealed } from "@/lib/drivers/shifts"
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

export interface DriverContactInfo {
  full_name: string
  phone: string
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_plate: string | null
  verification_status: string | null
}

// Minimal, read-only info for the driver assigned to a booking — deliberately
// exposed to the customer (via service role, bypassing the drivers table's
// normal owner/admin-only RLS) so they know who's picking them up and can
// identify the car at the kerb.
//
// The vehicle make/model/plate are on this list for that reason; the
// license/ID/vehicle *document* URLs deliberately are not, and must stay off it.
export async function getDriverContactInfo(
  driverId: string
): Promise<DriverContactInfo | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("drivers")
    .select("full_name, phone, vehicle_make, vehicle_model, vehicle_plate, verification_status")
    .eq("id", driverId)
    .maybeSingle()
  return (data as DriverContactInfo) ?? null
}

/**
 * The same details, but only once the booking says they may be shown.
 *
 * Assignment now happens at payment (0025), which is hours or days before the
 * ride, and the assigned driver can still change in that window — a shift gets
 * cancelled, a car breaks down. Showing a name that early means showing one
 * that may turn out to be wrong, so the reveal is held until
 * `driver_visible_at` (pickup minus the driver's notice, pinned at assignment).
 *
 * Every caller that renders driver details to a *traveler* must go through this
 * rather than `getDriverContactInfo`. The unguarded version stays for the
 * driver's own studio and for admin screens, where the whole point is to see
 * the assignment as soon as it exists.
 */
export async function getRevealedDriverInfo(
  booking: Pick<BookingRow, "driver_id" | "driver_visible_at" | "pickup_datetime">
): Promise<{ driver: DriverContactInfo | null; revealAt: Date | null }> {
  if (!booking.driver_id) return { driver: null, revealAt: null }

  const revealAt = booking.driver_visible_at
    ? new Date(booking.driver_visible_at)
    : new Date(new Date(booking.pickup_datetime).getTime() - 2 * 3_600_000)

  if (!isDriverRevealed(booking)) return { driver: null, revealAt }

  return { driver: await getDriverContactInfo(booking.driver_id), revealAt }
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
