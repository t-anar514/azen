import React from "react"

/**
 * Learn hero band (design doc, Screen 08): full-bleed deep-sky gradient with a
 * large watermark あ on the right, eyebrow + title + subtitle on the left.
 */
export function SonicHero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(115deg, #0C2E57 0%, #17457E 55%, #29538F 100%)",
      }}
    >
      {/* Oversized watermark character */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none font-display font-extrabold leading-none text-white/10"
        style={{ fontSize: "clamp(11rem, 26vw, 20rem)" }}
      >
        あ
      </span>

      <div className="relative mx-auto max-w-content px-4 py-16 md:px-6 md:py-20">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-200">
          Хэлний хөтөч
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          Аяны япон хэллэг
        </h1>
        <p className="mt-3 max-w-lg text-base text-sky-100/80 md:text-lg">
          Хамгийн хэрэгтэй хэллэгүүдийг дуудлагатай нь сур. Товшоод сонс, давт.
        </p>
      </div>
    </section>
  )
}
