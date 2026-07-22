import { CheckCircle2, MapPin, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PillBadge } from "@/components/ui/pill-badge"
import { BookGuideDialog } from "@/components/guides/BookGuideDialog"
import { MessageModal } from "@/components/guides/MessageModal"
import { cn, initials } from "@/lib/utils"
import type { GuideRow } from "@/lib/supabase/types"

/** Cover fill: the guide's own photo when set, else the Eternal Sky navy gradient. */
function CoverBackground({ guide, gradient }: { guide: GuideRow; gradient: string }) {
  return guide.cover_image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={guide.cover_image} alt="" className="absolute inset-0 size-full object-cover" />
  ) : (
    <div className="absolute inset-0" style={{ background: gradient }} />
  )
}

function GuideAvatar({ guide, className }: { guide: GuideRow; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center font-display font-extrabold text-white",
        className
      )}
      style={{ background: "linear-gradient(135deg,#1A4E8A,#2D7DD2)" }}
    >
      {guide.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={guide.image} alt={guide.name} className="size-full object-cover" />
      ) : (
        initials(guide.name)
      )}
    </div>
  )
}

function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex-1 rounded-[14px] bg-muted px-2 py-3 text-center">
      <div className="font-display text-[16px] font-extrabold text-foreground md:text-[19px]">
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground md:text-[10.5px]">{label}</div>
    </div>
  )
}

interface GuideProfileHeroProps {
  guide: GuideRow
  recCount: number
  tripCount: number
}

/**
 * Public guide profile hero (design doc, Screen 12 desktop / Screen 13 mobile
 * "MOBILE GUIDE PROFILE"): navy radial cover + saffron glow, an overlapping
 * profile card with a 3-stat block and the dual CTA (saffron book / outline
 * message — never two same-color high-emphasis buttons side by side).
 */
export function GuideProfileHero({ guide, recCount, tripCount }: GuideProfileHeroProps) {
  const ratingLabel = guide.rating.toFixed(1)
  const price = guide.price ?? 0

  return (
    <>
      {/* ── Mobile (Screen 13 — MOBILE GUIDE PROFILE) ── */}
      <div className="md:hidden">
        <div className="relative h-[150px] overflow-hidden">
          <CoverBackground
            guide={guide}
            gradient="radial-gradient(130% 150% at 75% 0%,#0F3B6B,#123456 50%,#0A1B2E)"
          />
          <div
            className="pointer-events-none absolute -top-5 right-[30px] size-[140px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(222,140,46,.32), transparent 62%)" }}
          />
        </div>

        <div className="relative -mt-[46px] mx-5 space-y-3.5 rounded-[20px] border border-border bg-card p-[18px] text-center shadow-sm">
          <div className="mx-auto -mt-[58px] size-20 overflow-hidden rounded-[20px] border-4 border-card shadow-[0_8px_20px_-8px_rgba(15,59,107,.5)]">
            <GuideAvatar guide={guide} className="size-full text-[30px]" />
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h1 className="font-display text-[19px] font-extrabold text-foreground">{guide.name}</h1>
            {guide.is_verified && <CheckCircle2 className="size-4 text-success" />}
          </div>

          {(guide.is_verified || guide.location) && (
            <p className="text-[12.5px] text-muted-foreground">
              {[guide.is_verified ? "Баталгаажсан хөтөч" : null, guide.location]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          {guide.bio && (
            <p className="text-[12.5px] leading-relaxed text-foreground/80">{guide.bio}</p>
          )}

          <div className="flex gap-2">
            <StatBox value={ratingLabel} label="Үнэлгээ" />
            <StatBox value={tripCount} label="Аялал" />
            <StatBox value={recCount} label="Зөвлөмж" />
          </div>

          <div className="flex gap-[9px]">
            <div className="flex-[1.5]">
              <BookGuideDialog
                guide={guide}
                trigger={
                  <Button variant="reserve" className="h-auto w-full rounded-[12px] p-[11px] text-[13px]">
                    Захиалах · ¥{price.toLocaleString()}
                  </Button>
                }
              />
            </div>
            <div className="flex-1">
              <MessageModal
                guideId={guide.id}
                guideName={guide.name}
                trigger={
                  <Button variant="outline" className="h-auto w-full rounded-[12px] p-[11px] text-[13px]">
                    Зурвас
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop (Screen 12) ── */}
      <div className="hidden md:block">
        <div className="relative h-[210px] overflow-hidden">
          <CoverBackground
            guide={guide}
            gradient="radial-gradient(120% 180% at 75% 0%,#0F3B6B,#123456 50%,#0A1B2E)"
          />
          <div
            className="pointer-events-none absolute -top-10 right-[120px] size-[280px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(222,140,46,.32), transparent 62%)" }}
          />
          {guide.location && (
            <div className="absolute bottom-4 right-7 inline-flex items-center gap-1.5 rounded-pill bg-white/[.14] px-3.5 py-1.5 text-xs font-semibold text-white">
              <MapPin className="size-3.5" /> {guide.location}
            </div>
          )}
        </div>

        <div className="mx-auto max-w-content px-8">
          <div className="relative -mt-[70px] flex items-start gap-5 rounded-[22px] border border-border bg-card p-6 shadow-[0_24px_60px_-30px_rgba(15,59,107,.4)]">
            <div className="size-[120px] shrink-0 overflow-hidden rounded-[24px] border-4 border-card shadow-[0_10px_30px_-12px_rgba(15,59,107,.5)]">
              <GuideAvatar guide={guide} className="size-full text-4xl" />
            </div>

            <div className="flex-1 pt-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-[28px] font-extrabold tracking-[-0.02em] text-foreground">
                  {guide.name}
                </h1>
                {guide.is_verified && (
                  <PillBadge variant="sage">
                    <CheckCircle2 /> Баталгаажсан хөтөч
                  </PillBadge>
                )}
              </div>

              {guide.bio && (
                <p className="mt-3 max-w-[660px] text-[14.5px] leading-relaxed text-muted-foreground">
                  {guide.bio}
                </p>
              )}

              {guide.tags.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-2">
                  {guide.tags.map((tag) => (
                    <PillBadge key={tag} variant="sky">
                      {tag}
                    </PillBadge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex w-[220px] shrink-0 flex-col gap-2.5">
              <div className="flex gap-2">
                <StatBox value={ratingLabel} label="Үнэлгээ" />
                <StatBox value={tripCount} label="Аялал" />
                <StatBox value={recCount} label="Зөвлөмж" />
              </div>
              <BookGuideDialog guide={guide} />
              <MessageModal
                guideId={guide.id}
                guideName={guide.name}
                trigger={
                  <Button variant="outline" className="h-auto w-full gap-1.5 rounded-[14px] p-[11px] text-[13.5px]">
                    <MessageCircle className="size-[15px]" /> Зурвас илгээх
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
