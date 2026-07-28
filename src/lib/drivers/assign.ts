import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Hands a paid transfer to a driver.
 *
 * This is what replaced the "жолооч зөвшөөрөх" step. The traveler booked a slot
 * the driver had already opened, so there is nobody left to ask — the only
 * remaining question is which of the drivers who opened that slot gets it, and
 * `claim_driver_slot` (0025) answers it inside a single locking UPDATE so two
 * simultaneous payments cannot both take the last vehicle.
 *
 * Service role, because that RPC is not callable by `authenticated`: assignment
 * has to be something the system does on payment, never something a client can
 * trigger for itself.
 *
 * Returns the driver id, or null when nobody was free. A null is deliberately
 * not an error here — the traveler has already paid and their booking stands.
 * It is an operations problem (the row shows `confirmed` with no driver), and
 * the coverage chart on /admin/drivers exists to make it a rare one.
 */
export async function assignDriverForBooking(
  bookingId: string
): Promise<{ driverId: string | null; error: string | null }> {
  const admin = createAdminClient()

  const { data: booking, error: readError } = await admin
    .from("bookings")
    .select("id, driver_id, shift_date, shift_slot, status")
    .eq("id", bookingId)
    .maybeSingle()

  if (readError) return { driverId: null, error: readError.message }
  if (!booking) return { driverId: null, error: "booking not found" }

  // Idempotent: a redelivered webhook or a second "mark paid" click must not
  // consume a second vehicle from the slot.
  if (booking.driver_id) return { driverId: booking.driver_id as string, error: null }

  // Bookings taken before 0025 have no shift to claim against. They stay
  // manually assigned rather than being silently dropped into a slot they were
  // never sold from.
  if (!booking.shift_date || !booking.shift_slot) {
    return { driverId: null, error: null }
  }

  const { data, error } = await admin.rpc("claim_driver_slot", {
    p_booking_id: bookingId,
    p_date: booking.shift_date,
    p_slot: booking.shift_slot,
  })

  if (error) return { driverId: null, error: error.message }
  return { driverId: (data as string | null) ?? null, error: null }
}

/** Inverse of the above, for a cancellation — puts the vehicle back on sale. */
export async function releaseDriverForBooking(bookingId: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc("release_driver_slot", { p_booking_id: bookingId })
  return !error && Boolean(data)
}
