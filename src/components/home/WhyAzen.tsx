import { ShieldAlert, Sparkles, UserRoundCheck, Users } from "lucide-react"

/**
 * "Яагаад аялагчид биднийг сонгодог вэ?" (design doc, Screen 01).
 * Four cards; the last one is dark (#16202B) to anchor the row.
 */
const CARDS = [
  {
    icon: UserRoundCheck,
    iconBg: "bg-tint-sky",
    iconColor: "text-primary",
    title: "Хөтөч",
    body: "Мэргэжлийн хөтөч бус, нутгийн иргэдтэй холбогдож жинхэнэ соёлтой танилц.",
  },
  {
    icon: ShieldAlert,
    iconBg: "bg-tint-saffron",
    iconColor: "text-saffron-600",
    title: "Улиг болсон газраас зайлсхийх",
    body: "Хэт үнэтэй газраас сэрэмжлүүлж, илүү дээр хувилбар санал болгоно.",
  },
  {
    icon: Sparkles,
    iconBg: "bg-tint-sage",
    iconColor: "text-success",
    title: "Ухаалаг хэмнэлт",
    body: "JR Pass болон бусад зардлыг хэмнэх зөвлөмж, төсвийн хяналт.",
  },
]

export function WhyAzen() {
  return (
    <section className="mx-auto max-w-content px-4 md:px-8 py-16">
      <div className="mx-auto mb-10 max-w-[600px] text-center">
        <div className="text-eyebrow">Azen-ий давуу тал</div>
        <h2 className="mt-2 font-display text-[34px] font-extrabold tracking-[-0.015em] text-foreground">
          Яагаад аялагчид биднийг сонгодог вэ?
        </h2>
      </div>

      <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-[20px] border border-border bg-card p-[26px]"
          >
            <div
              className={`mb-4 flex size-[52px] items-center justify-center rounded-[14px] ${card.iconBg}`}
            >
              <card.icon className={`size-6 ${card.iconColor}`} strokeWidth={1.9} />
            </div>
            <h3 className="mb-1.5 font-display text-lg font-bold text-foreground">{card.title}</h3>
            <p className="text-[13.5px] leading-[1.55] text-muted-foreground">{card.body}</p>
          </div>
        ))}

        {/* dark anchor card */}
        <div className="rounded-[20px] p-[26px] text-white" style={{ background: "#16202B" }}>
          <div className="mb-4 flex size-[52px] items-center justify-center rounded-[14px] bg-white/10">
            <Users className="size-6" strokeWidth={1.9} style={{ color: "#8FC0F0" }} />
          </div>
          <h3 className="mb-1.5 font-display text-lg font-bold">Хамтдаа төлөвлө</h3>
          <p className="text-[13.5px] leading-[1.55] text-white/70">
            Найзуудаа урьж, төлөвлөгөө болон төсвөө хамтдаа хуваалц.
          </p>
        </div>
      </div>
    </section>
  )
}
