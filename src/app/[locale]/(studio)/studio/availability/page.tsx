import { redirect } from "next/navigation"

import { getCurrentGuide } from "@/lib/guides/current"
import { guideFallbackPath } from "@/lib/studio/context"
import { loadAvailability } from "@/lib/guides/availabilityData"
import { AvailabilityCalendar } from "@/components/studio/AvailabilityCalendar"
import { MAX_MONTHS_AHEAD, toDateKey } from "@/lib/guides/availability"

/**
 * `/studio/availability` (Боломжит өдөр) — blocklist editor. A guide is
 * bookable unless they say otherwise; confirmed bookings close their day
 * automatically and are not editable here.
 */
export default async function StudioAvailabilityPage() {
  const ctx = await getCurrentGuide()
  if (!ctx) redirect(await guideFallbackPath())

  const from = toDateKey(new Date())
  const end = new Date()
  end.setMonth(end.getMonth() + MAX_MONTHS_AHEAD)
  const to = toDateKey(end)

  const { blocked, booked } = await loadAvailability(ctx.guide.id, from, to)

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">
          Боломжит өдөр
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ажиллах боломжгүй өдрөө хаана. Хаагаагүй өдөр бүр захиалгад нээлттэй.
        </p>
      </header>

      <AvailabilityCalendar initialBlocked={blocked} booked={booked} />
    </div>
  )
}
