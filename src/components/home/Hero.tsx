"use client"

import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"

interface HeroProps {
  placeCount: number
  guideCount: number
  cityCount: number
}

/**
 * Dark hero (design doc, Screen 01): navy radial gradient, atmospheric glows
 * (Fuji-dawn saffron + Tokyo-tower blue), a faint skyline silhouette, and a
 * white floating panel holding the universal search + the two path cards.
 */
export function Hero({ placeCount, guideCount, cityCount }: HeroProps) {
  const t = useTranslations("Hero")

  // the global ⌘K palette already listens on window — reuse it
  function openSearch() {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    )
  }

  return (
    <section
      className="relative overflow-hidden px-4 md:px-8 pt-16 pb-24"
      style={{
        background:
          "radial-gradient(130% 120% at 78% 8%, #0F3B6B 0%, #123456 42%, #0C2036 100%)",
      }}
    >
      {/* atmospheric glows */}
      <div
        className="pointer-events-none absolute -top-16 right-[8%] h-[420px] w-[420px] rounded-full blur-[14px]"
        style={{ background: "radial-gradient(circle, rgba(222,140,46,.42), transparent 62%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-10 h-[520px] w-[520px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(45,125,210,.35), transparent 65%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 55%, rgba(12,32,54,.6))" }}
      />

      {/* faint skyline silhouette */}
      <svg
        width="100%"
        height="120"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 left-0 opacity-50"
        aria-hidden
      >
        <path
          d="M0 120 L0 80 L40 80 L40 60 L80 60 L80 90 L130 90 L130 40 L150 30 L170 40 L170 85 L230 85 L230 65 L280 65 L280 95 L340 95 L340 55 L360 45 L370 20 L380 45 L400 55 L400 90 L470 90 L470 70 L520 70 L520 100 L600 100 L600 60 L650 60 L650 85 L720 85 L720 50 L760 50 L760 88 L840 88 L840 68 L900 68 L900 95 L980 95 L980 58 L1010 46 L1030 58 L1030 90 L1110 90 L1110 72 L1170 72 L1170 100 L1260 100 L1260 62 L1310 62 L1310 88 L1380 88 L1380 78 L1440 78 L1440 120 Z"
          fill="#0A1B2E"
        />
      </svg>

      <div className="relative z-[2] mx-auto max-w-5xl text-center">
        {/* route eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.04em] text-white/70">
          Улаанбаатар
          <svg className="az-route" width="70" height="16" viewBox="0 0 70 16" fill="none" aria-hidden>
            <path d="M4 12 Q35 -2 66 8" stroke="#DE8C2E" strokeWidth="1.6" />
            <circle cx="4" cy="12" r="3" fill="#DE8C2E" />
            <circle cx="66" cy="8" r="3" fill="#fff" />
          </svg>
          Токио
        </div>

        <h1 className="font-display text-[clamp(40px,5vw,62px)] font-extrabold leading-[1.04] tracking-[-0.02em] text-white">
          {t("title")}
          <br />
          <span className="italic" style={{ color: "#8FC0F0" }}>
            {t("subtitle")}
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-[600px] text-lg leading-relaxed text-white/80">
          Нутгийн хөтчүүдийн санал болгосон газраар аялж, ухаалаг төлөвлөгчөөр өдрөө угсар.
          Нэг платформ дээр — нээ, төлөвлө, захиал.
        </p>

        {/* floating action panel */}
        <div className="mx-auto mt-9 max-w-[760px] rounded-[24px] bg-white p-4 shadow-[0_30px_60px_-24px_rgba(0,0,0,.5)]">
          <button
            type="button"
            onClick={openSearch}
            className="flex w-full items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F6F8FB] px-[18px] py-3.5 text-left transition-colors hover:bg-[#EEF2F7]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A4E8A" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="flex-1 truncate text-[15.5px] text-[#94A3B8]">
              Хот, газар, нутгийн хөтөч хайх…
            </span>
            <span className="rounded-lg bg-[#EAF2FB] px-2.5 py-[5px] text-xs font-semibold text-[#1A4E8A]">
              ⌘K
            </span>
          </button>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {/* Explore guide — blue gradient */}
            <Link
              href="/essentials"
              className="group relative overflow-hidden rounded-2xl p-[18px_20px] text-left text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #1A4E8A, #2D7DD2)" }}
            >
              <div className="mb-3 flex size-[42px] items-center justify-center rounded-xl bg-white/[.16]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="m15.5 8.5-2 5-5 2 2-5z" fill="#fff" stroke="none" />
                </svg>
              </div>
              <div className="font-display text-lg font-bold">Аялах хөтөч үзэх</div>
              <div className="mt-[3px] text-[13.5px] text-white/80">
                Хот, газар, нутгийн хөтчөөр аяллаа эхлүүл
              </div>
              <svg
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
                className="absolute right-5 top-5 transition-transform group-hover:translate-x-0.5" aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>

            {/* Plan — cream */}
            <Link
              href="/planner"
              className="group relative overflow-hidden rounded-2xl border border-[#F1DEBE] bg-[#FCF2E3] p-[18px_20px] text-left transition-transform hover:-translate-y-0.5"
            >
              <div className="mb-3 flex size-[42px] items-center justify-center rounded-xl bg-[#DE8C2E]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden>
                  <circle cx="6" cy="19" r="2.5" />
                  <circle cx="18" cy="5" r="2.5" />
                  <path d="M8 19h6a3 3 0 0 0 3-3V8" />
                </svg>
              </div>
              <div className="font-display text-lg font-bold text-[#16202B]">Аялал төлөвлөх</div>
              <div className="mt-[3px] text-[13.5px] text-[#8A6A38]">
                Өдрийн төлөвлөгөө, төсөв, найзуудтайгаа
              </div>
              <svg
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9761E" strokeWidth="2.5"
                className="absolute right-5 top-5 transition-transform group-hover:translate-x-0.5" aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* stats */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-1 text-[13.5px] font-medium text-white/[.78]">
          <span>
            <b className="font-display text-white">{placeCount}+</b> газар
          </span>
          <span className="opacity-40">·</span>
          <span>
            <b className="font-display text-white">{guideCount}</b> нутгийн хөтөч
          </span>
          <span className="opacity-40">·</span>
          <span>
            <b className="font-display text-white">{cityCount}</b> хот
          </span>
        </div>
      </div>
    </section>
  )
}
