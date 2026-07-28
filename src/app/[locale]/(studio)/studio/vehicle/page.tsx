import { redirect } from "next/navigation"
import { BadgeCheck, FileWarning } from "lucide-react"

import { getStudioContext } from "@/lib/studio/context"
import { cn } from "@/lib/utils"

export const metadata = { title: "Миний машин | Azen Studio" }

const DOCUMENTS = [
  { key: "id_document_url", label: "Иргэний үнэмлэх" },
  { key: "license_document_url", label: "Жолооны үнэмлэх" },
  { key: "vehicle_document_url", label: "Тээврийн хэрэгслийн гэрчилгээ" },
] as const

/**
 * `/studio/vehicle` (Миний машин) — read-only.
 *
 * Plate, licence and documents are what an admin approved this driver on, so
 * they are not self-editable: changing them here would let an approved driver
 * swap in an unvetted car and keep the approval. Edits go back through support,
 * which is what the note at the bottom says.
 */
export default async function DriverVehiclePage() {
  const context = await getStudioContext()
  if (!context) redirect("/login?redirectTo=/studio/vehicle")
  if (context.kind !== "driver") redirect("/studio")

  const { driver } = context

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">Миний машин</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Аялагчид энэ мэдээллийг авах цагаас {driver.min_notice_hours} цагийн өмнө харна.
        </p>
      </header>

      <section className="rounded-card border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-4 text-success" />
          <span className="text-[12.5px] font-bold text-success">Баталгаажсан</span>
        </div>
        <div className="mt-3 font-display text-xl font-extrabold text-foreground">
          {driver.vehicle_make} {driver.vehicle_model}
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-well border border-border p-3">
            <dt className="text-[11px] text-muted-foreground">Улсын дугаар</dt>
            <dd className="mt-0.5 text-[13.5px] font-bold text-foreground">
              {driver.vehicle_plate}
            </dd>
          </div>
          <div className="rounded-well border border-border p-3">
            <dt className="text-[11px] text-muted-foreground">Жолооны үнэмлэх</dt>
            <dd className="mt-0.5 text-[13.5px] font-bold text-foreground">
              {driver.license_number}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 rounded-card border border-border bg-card p-5">
        <h2 className="mb-3 font-display text-base font-bold text-foreground">Бичиг баримт</h2>
        <ul className="space-y-2">
          {DOCUMENTS.map((doc) => {
            const url = driver[doc.key]
            return (
              <li
                key={doc.key}
                className={cn(
                  "flex items-center gap-2.5 rounded-well border p-3 text-[13px]",
                  url ? "border-border" : "border-destructive/30 bg-destructive/5"
                )}
              >
                {url ? (
                  <BadgeCheck className="size-4 shrink-0 text-success" />
                ) : (
                  <FileWarning className="size-4 shrink-0 text-destructive" />
                )}
                <span className="flex-1 font-semibold text-foreground">{doc.label}</span>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] font-bold text-primary hover:underline"
                  >
                    Харах
                  </a>
                ) : (
                  <span className="text-[12px] font-bold text-destructive">Дутуу</span>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-[12px] text-muted-foreground">
          Машин эсвэл бичиг баримтаа солих бол Azen-тэй холбогдоно уу — өөрчлөлт бүр дахин
          баталгаажуулалт шаарддаг.
        </p>
      </section>
    </div>
  )
}
