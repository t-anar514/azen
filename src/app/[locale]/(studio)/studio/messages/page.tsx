import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentGuide } from "@/lib/guides/current"
import { guideFallbackPath } from "@/lib/studio/context"
import { Badge } from "@/components/ui/badge"
import { MarkReadButton } from "@/components/account/MarkReadButton"
import { initials } from "@/lib/utils"
import type { MessageRow } from "@/lib/supabase/types"

/**
 * `/studio/messages` (Зурвас) — the guide's inbox: free-form messages and
 * booking inquiries from travelers. Sender names come from the SECURITY
 * DEFINER `participant_display_name` RPC (a guide can't read other profiles
 * rows directly), mirroring the dashboard/bookings pattern.
 */
export default async function StudioMessagesPage() {
  const ctx = await getCurrentGuide()
  if (!ctx) redirect(await guideFallbackPath())
  const { guide } = ctx
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from("messages")
    .select("id,sender_id,type,body,trip_date,interest,status,created_at")
    .eq("guide_id", guide.id)
    .order("created_at", { ascending: false })
    .returns<MessageRow[]>()
  const messages = rows ?? []

  const names = await Promise.all(
    messages.map((m) =>
      supabase
        .rpc("participant_display_name", { p_user_id: m.sender_id })
        .then(({ data }) => (data as string | null)?.trim() || "Аялагч")
    )
  )

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">Зурвас</h1>
        <p className="mt-1 text-sm text-muted-foreground">Аялагчдаас ирсэн зурвас, лавлагаа.</p>
      </header>

      {messages.length === 0 ? (
        <div className="rounded-card border border-border bg-card px-5 py-16 text-center">
          <p className="text-sm text-muted-foreground">Одоогоор зурвас алга.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div
              key={m.id}
              className="flex gap-3 rounded-card border border-border bg-card p-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-[13px] font-bold text-white">
                {initials(names[i])}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{names[i]}</span>
                  <Badge variant={m.type === "booking" ? "rating" : "paid"}>
                    {m.type === "booking" ? "Захиалга" : "Зурвас"}
                  </Badge>
                  {m.status === "new" && (
                    <span className="size-2 rounded-full bg-saffron" aria-label="шинэ" />
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString("mn-MN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {m.body && <p className="mt-1 text-sm text-foreground/90">{m.body}</p>}
                {(m.interest || m.trip_date) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.interest}
                    {m.interest && m.trip_date ? " · " : ""}
                    {m.trip_date}
                  </p>
                )}
                {m.status === "new" && (
                  <div className="mt-2.5">
                    <MarkReadButton messageId={m.id} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
