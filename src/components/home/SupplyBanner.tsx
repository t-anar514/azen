import { Car, UserPlus } from "lucide-react"

import { Link } from "@/i18n/routing"

/**
 * Supply funnel (design doc, Screen 01): two side-by-side cards — a white
 * "become a guide" (outlined CTA) and a dark "become a driver" (saffron CTA).
 */
export function SupplyBanner() {
  return (
    <section className="mx-auto max-w-content px-4 md:px-8 pb-[72px]">
      <div className="grid gap-[18px] md:grid-cols-2">
        {/* guide — light */}
        <div className="flex flex-col rounded-[24px] border border-border bg-card p-[34px]">
          <div className="mb-[18px] flex size-12 items-center justify-center rounded-[14px] bg-tint-sky">
            <UserPlus className="size-[22px] text-primary" strokeWidth={1.9} />
          </div>
          <h3 className="mb-1.5 font-display text-[22px] font-extrabold text-foreground">
            Нутгийн хөтөч болох
          </h3>
          <p className="mb-5 flex-1 text-sm leading-[1.55] text-muted-foreground">
            Өөрийн хотоо мэддэг үү? Аялагчдад санал болгож, орлого олоорой.
          </p>
          <Link
            href="/guides/apply"
            className="self-start rounded-full border-[1.5px] border-primary bg-card px-6 py-[11px] text-sm font-bold text-primary transition-colors hover:bg-tint-sky"
          >
            Хөтөч болох
          </Link>
        </div>

        {/* driver — dark */}
        <div
          className="relative flex flex-col overflow-hidden rounded-[24px] p-[34px] text-white"
          style={{ background: "#16202B" }}
        >
          <div
            className="pointer-events-none absolute -right-5 -top-8 h-[180px] w-[180px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(222,140,46,.35), transparent 62%)" }}
          />
          <div className="relative mb-[18px] flex size-12 items-center justify-center rounded-[14px] bg-white/10">
            <Car className="size-[22px]" strokeWidth={1.9} style={{ color: "#ECA64F" }} />
          </div>
          <h3 className="relative mb-1.5 font-display text-[22px] font-extrabold">Жолооч болох</h3>
          <p className="relative mb-5 flex-1 text-sm leading-[1.55] text-white/70">
            Нисэх буудлын тосох үйлчилгээгээр уян хатан цагаар орлого нэм.
          </p>
          <Link
            href="/driver/apply"
            className="relative self-start rounded-full px-6 py-[11px] text-sm font-bold text-white"
            style={{ background: "#DE8C2E" }}
          >
            Жолооч болох
          </Link>
        </div>
      </div>
    </section>
  )
}
