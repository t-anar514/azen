/**
 * "Гурван алхам" process row (design doc, Screen 01): dark section with
 * ghost-numeral steps; the final step gets a saffron top border.
 */
const STEPS = [
  {
    n: "01",
    border: "rgba(255,255,255,.14)",
    numColor: "rgba(255,255,255,.14)",
    title: "Таны сонголт",
    body: "Хэмнэл, сонирхол, төсвөө хэлнэ. Дөрвөн асуулт, бүртгэлгүй.",
  },
  {
    n: "02",
    border: "rgba(255,255,255,.14)",
    numColor: "rgba(255,255,255,.14)",
    title: "Бид бүтээнэ",
    body: "Хөтчүүдийн санал болгосон газраас өдрийн төлөвлөгөө бүтээнэ.",
  },
  {
    n: "03",
    border: "#DE8C2E",
    numColor: "rgba(222,140,46,.3)",
    title: "Та амсана",
    body: "Хөтөч, тээвэр, төсвийн хуваалт — бүгд нэг дороо.",
  },
]

export function HowItWorks() {
  return (
    <section style={{ background: "#16202B" }} className="text-white">
      <div className="mx-auto max-w-content px-4 md:px-8 py-[72px]">
        <div className="mb-11 max-w-[520px]">
          <div className="text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: "#8FC0F0" }}>
            Хэрхэн ажилладаг вэ
          </div>
          <h2 className="mt-2 font-display text-[34px] font-extrabold tracking-[-0.015em]">
            Гурван алхам
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="pt-6" style={{ borderTop: `2px solid ${step.border}` }}>
              <div className="font-display text-[56px] font-extrabold leading-none" style={{ color: step.numColor }}>
                {step.n}
              </div>
              <h3 className="mb-2 mt-4 font-display text-xl font-bold">{step.title}</h3>
              <p className="text-sm leading-[1.6] text-white/[.66]">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
