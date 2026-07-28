import { Car } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getActiveVehicleOptions } from "@/lib/transfers/options"
import { getRevealedDriverInfo } from "@/lib/bookings"
import { TransferBookingForm } from "@/components/transfer/TransferBookingForm"
import { ActiveBookingBanner } from "@/components/transfer/ActiveBookingBanner"
import { GuestBookingLookup } from "@/components/transfer/GuestBookingLookup"
import type { BookingRow, BookingStatus } from "@/lib/supabase/types"

export const metadata = {
  title: "Хүргэх/Тосох захиалах | Azen",
  description: "Японд буух эсвэл явах нислэгтэй холбоотой Хүргэх/Тосохээ тогтмол үнээр захиалаарай.",
}

// Everything that isn't a finished or cancelled trip counts as "in flight".
const ACTIVE_STATUSES: BookingStatus[] = [
  "pending_payment",
  "confirmed",
  "assigned",
  "en_route",
  "arrived",
  "picked_up",
]

interface PageProps {
  searchParams: Promise<{ new?: string }>
}

export default async function TransferPage({ searchParams }: PageProps) {
  const { new: forceNew } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // State A — a signed-in user with a live booking sees it straight away,
  // unless they explicitly asked to book another (?new=1).
  if (user && !forceNew) {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: false })
      .limit(1)

    const active = (data?.[0] as BookingRow | undefined) ?? null
    if (active) {
      // Gated: assignment now happens at payment, hours before pickup, and the
      // assigned driver can still change until the reveal window opens.
      const { driver } = await getRevealedDriverInfo(active)
      return <ActiveBookingBanner booking={active} driver={driver} />
    }
  }

  // State C — the fresh estimate + booking flow.
  const vehicleOptions = await getActiveVehicleOptions()

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto max-w-content px-5 pt-6 md:px-6 md:pt-12">
        <section className="max-w-2xl">
          {/* Mobile title (design doc, Screen 13) */}
          <h1 className="font-display text-[22px] font-extrabold text-foreground md:hidden">
            Нисэх буудлын трансфер
          </h1>

          {/* Desktop header */}
          <div className="hidden md:block">
            <span className="inline-flex items-center gap-1.5 text-eyebrow">
              <Car className="size-3.5" /> Хаалганаас хаалга хүртэл
            </span>
            <h1 className="mt-2 text-section text-foreground">Нисэх буудлын хүргэлт захиалах</h1>
            <p className="mt-3 text-lead">
              Тогтмол үнэ, нэмэлт төлбөргүй. Нислэгийн дугаараа өгөхөд бид таны буух цагт тохируулна.
            </p>
          </div>

          {/* State B — guests who lost their link can recover it here. */}
          {!user && (
            <div className="mt-4 md:mt-6">
              <GuestBookingLookup />
            </div>
          )}
        </section>

        <div className="mt-5 md:mt-8">
          <TransferBookingForm vehicleOptions={vehicleOptions} />
        </div>
      </div>
    </div>
  )
}
