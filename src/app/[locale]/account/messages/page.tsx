import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MarkReadButton } from "@/components/account/MarkReadButton"

interface InboxMessage {
  id: string
  type: "message" | "booking"
  body: string | null
  trip_date: string | null
  interest: string | null
  status: "new" | "read"
  created_at: string
  profiles: { full_name: string | null } | null
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function GuideInboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirectTo=/account/messages")
  }

  const { data: guide } = await supabase
    .from("guides")
    .select("id, name")
    .eq("profile_id", user.id)
    .maybeSingle()

  if (!guide) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground">
              Энэ хэсэг зөвхөн хөтөч бүртгэлд зориулагдсан. Танд одоогоор хөтөчийн профайл холбогдоогүй байна.
            </p>
            <Button asChild variant="outline">
              <Link href="/account">Буцах</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, type, body, trip_date, interest, status, created_at, profiles(full_name)")
    .eq("guide_id", guide.id)
    .order("created_at", { ascending: false })

  const inbox = (messages ?? []) as unknown as InboxMessage[]

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Ирсэн зурвасууд
          </h1>
          <p className="text-muted-foreground">
            {guide.name}-д ирсэн зурвас болон захиалгын хүсэлтүүд.
          </p>
        </header>

        {inbox.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-muted-foreground">
              Одоогоор ямар нэгэн зурвас ирээгүй байна.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {inbox.map((m) => (
              <Card key={m.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {m.profiles?.full_name || "Зорчигч"}
                      </span>
                      <Badge variant={m.type === "booking" ? "default" : "secondary"}>
                        {m.type === "booking" ? "Захиалгын хүсэлт" : "Зурвас"}
                      </Badge>
                      {m.status === "new" && <Badge variant="outline">Шинэ</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(m.created_at)}
                    </span>
                  </div>

                  {m.type === "booking" && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      {m.trip_date && <p>Огноо: {m.trip_date}</p>}
                      {m.interest && <p>Сонирхол: {m.interest}</p>}
                    </div>
                  )}

                  {m.body && <p className="text-sm">{m.body}</p>}

                  {m.status === "new" && (
                    <div className="pt-1">
                      <MarkReadButton messageId={m.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
