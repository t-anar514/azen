import { ArrowRight } from "lucide-react"

import { Link } from "@/i18n/routing"

/**
 * "Намрийн 14 хоног аялал" banner (design doc, Screen 01): dark-blue gradient
 * card, an illustrated Fuji tile on the right, saffron CTA into the planner.
 */
export function FeaturedItinerary() {
  return (
    <section className="mx-auto max-w-content px-4 md:px-8 pb-16 pt-5">
      <div
        className="relative flex flex-col items-start gap-10 overflow-hidden rounded-[28px] p-8 md:flex-row md:items-center md:p-[48px_52px]"
        style={{ background: "linear-gradient(105deg, #0F3B6B 0%, #1A4E8A 42%, #2D7DD2 100%)" }}
      >
        <div
          className="pointer-events-none absolute -top-10 right-[120px] h-[300px] w-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(222,140,46,.3), transparent 65%)" }}
        />

        <div className="relative max-w-[560px] flex-1 text-white">
          <span className="inline-flex items-center gap-[7px] rounded-full bg-white/[.14] px-[13px] py-1.5 text-xs font-semibold">
            ✦ Онцлох хөтөлбөр · 14 хоног
          </span>
          <h2 className="mt-4 font-display text-[36px] font-extrabold leading-[1.1] tracking-[-0.015em]">
            Намрийн 14 хоног аялал
          </h2>
          <p className="mt-3 text-base text-white/80">
            Токио · Хаконэ · Киото · Осака · Хирошима. Бэлэн өдрийн төлөвлөгөө, нэг товшилтоор
            өөрийн болго.
          </p>
          <div className="mt-6 flex items-center gap-[22px]">
            <Link
              href="/planner"
              className="inline-flex items-center gap-[9px] rounded-full px-[26px] py-[13px] text-[15px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(222,140,46,.7)]"
              style={{ background: "#DE8C2E" }}
            >
              Төлөвлөгчид нэмэх <ArrowRight className="size-[17px]" strokeWidth={2.4} />
            </Link>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">
                Зардал ойролцоогоор
              </div>
              <div className="font-display text-2xl font-extrabold">¥285,000</div>
            </div>
          </div>
        </div>

        {/* Fuji illustration tile */}
        <div
          className="relative h-[210px] w-full shrink-0 overflow-hidden rounded-[20px] shadow-[0_20px_40px_-16px_rgba(0,0,0,.5)] md:w-[300px]"
          style={{ background: "linear-gradient(160deg, #1E293B, #0F3B6B)" }}
        >
          <svg
            width="120" height="90" viewBox="0 0 120 90"
            className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2" aria-hidden
          >
            <path d="M10 80 L45 22 L58 42 L70 30 L110 80 Z" fill="#fff" opacity=".9" />
            <path d="M38 32 L45 22 L52 32 Z" fill="#DE8C2E" />
          </svg>
          <div className="absolute bottom-3 left-3.5 rounded-lg bg-black/30 px-2.5 py-1 text-xs font-semibold text-white">
            🗻 Фүжи уул
          </div>
        </div>
      </div>
    </section>
  )
}
