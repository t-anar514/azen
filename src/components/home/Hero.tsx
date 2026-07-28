"use client"

import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { HeroSearch } from "@/components/home/HeroSearch"

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

  return (
    <>
      {/* ── Mobile hero (design doc, Screen 13 — MOBILE HOME) ── */}
      <div className="md:hidden">
        {/* contained rounded hero card */}
        <div
          className="relative mx-3.5 mt-1.5 overflow-hidden rounded-3xl px-5 pb-[22px] pt-[26px]"
          style={{
            background:
              "radial-gradient(130% 120% at 75% 5%, #0F3B6B, #123456 50%, #0A1B2E)",
          }}
        >
          <div
            className="pointer-events-none absolute -top-5 right-0 h-40 w-40 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(222,140,46,.4), transparent 62%)" }}
          />
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
              УБ
              <svg className="az-route" width="44" height="12" viewBox="0 0 44 12" fill="none" aria-hidden>
                <path d="M3 9 Q22 -1 41 6" stroke="#DE8C2E" strokeWidth="1.4" />
                <circle cx="3" cy="9" r="2.4" fill="#DE8C2E" />
                <circle cx="41" cy="6" r="2.4" fill="#fff" />
              </svg>
              Токио
            </div>
            <h1 className="font-display text-[27px] font-extrabold leading-[1.08] text-white">
              Японыг жинхэнэ утгаар нь
            </h1>
            <p className="mt-2.5 text-[13.5px] text-white/80">Нээ, төлөвлө, захиал — нэг дор.</p>
          </div>
        </div>

        {/* overlapping search */}
        <HeroSearch
          variant="mobile"
          className="relative z-[5] -mt-3.5 mx-5 w-[calc(100%-2.5rem)]"
        />

        {/* two path tiles */}
        <div className="grid grid-cols-2 gap-3 px-5 pt-4">
          <Link
            href="/essentials"
            className="rounded-2xl p-4 text-white"
            style={{ background: "linear-gradient(135deg, #1A4E8A, #2D7DD2)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="m15.5 8.5-2 5-5 2 2-5z" fill="#fff" stroke="none" />
            </svg>
            <div className="mt-2.5 font-display text-[15px] font-bold">Аялах хөтөч</div>
          </Link>
          <Link href="/planner" className="rounded-2xl border border-[#F1DEBE] bg-[#FCF2E3] p-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DE8C2E" strokeWidth="2" aria-hidden>
              <circle cx="6" cy="19" r="2.5" />
              <circle cx="18" cy="5" r="2.5" />
              <path d="M8 19h6a3 3 0 0 0 3-3V8" />
            </svg>
            <div className="mt-2.5 font-display text-[15px] font-bold text-[#16202B]">Аялал төлөвлөх</div>
          </Link>
        </div>
      </div>

      {/* ── Desktop hero (design doc, Screen 01) ── */}
      <section
        className="relative hidden overflow-hidden px-4 md:block md:px-8 pt-16 pb-24"
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
            Хөтчүүдийн санал болгосон газраар аялж, ухаалаг төлөвлөгчөөр өдрөө бүтээ.
            Нэг платформ дээр — нээ, төлөвлө, захиал.
          </p>

          {/* floating action panel */}
          <div className="mx-auto mt-9 max-w-[760px] rounded-[24px] bg-white p-4 shadow-[0_30px_60px_-24px_rgba(0,0,0,.5)]">
            <HeroSearch variant="desktop" />

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
              <b className="font-display text-white">{guideCount}</b> Хөтөч
            </span>
            <span className="opacity-40">·</span>
            <span>
              <b className="font-display text-white">{cityCount}</b> хот
            </span>
          </div>
        </div>
      </section>
    </>
  )
}
