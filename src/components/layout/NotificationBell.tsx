"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Bell, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { notificationChannelTopic } from "./notificationChannel"

interface NotificationRow {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

// Compact Mongolian relative time — hand-rolled (no toLocaleString) so it can't
// differ between renders; falls back to a date for anything older than a week.
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const secs = Math.round((Date.now() - then) / 1000)
  if (secs < 60) return "саяхан"
  const mins = Math.round(secs / 60)
  if (mins < 60) return `${mins} мин`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} цаг`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} хоног`
  const d = new Date(iso)
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
}

// Navbar bell: lists the signed-in user's notifications with an unread badge,
// updated live over Realtime (see 0019_notifications.sql). Renders nothing for
// signed-out visitors. Clicking a notification marks it read and follows its
// link (e.g. a trip invite → the accept page).
export function NotificationBell({ className }: { className?: string }) {
  const [supabase] = React.useState(() => createClient())
  // Distinguishes this mount from the navbar's other bell on the shared
  // singleton client — see notificationChannelTopic.
  const instanceId = React.useId()
  const router = useRouter()
  const [userId, setUserId] = React.useState<string | null>(null)
  const [items, setItems] = React.useState<NotificationRow[]>([])
  const [open, setOpen] = React.useState(false)

  const unread = items.filter((n) => !n.is_read).length

  // Track auth so the bell appears/disappears with the session.
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUserId(session?.user?.id ?? null)
    )
    return () => sub.subscription.unsubscribe()
  }, [supabase])

  // Initial fetch of the recent notifications for this user.
  React.useEffect(() => {
    if (!userId) {
      setItems([])
      return
    }
    let cancelled = false
    supabase
      .from("notifications")
      .select("id, type, title, body, link, is_read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!cancelled && data) setItems(data as NotificationRow[])
      })
    return () => {
      cancelled = true
    }
  }, [userId, supabase])

  // Live updates. Realtime RLS is checked against the socket's JWT, so push it
  // before subscribing or private events silently never arrive (same gotcha as
  // usePlannerRealtime).
  React.useEffect(() => {
    if (!userId) return
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) await supabase.realtime.setAuth(data.session.access_token)
      if (cancelled) return
      channel = supabase
        .channel(notificationChannelTopic(userId, instanceId))
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          (payload) => setItems((prev) => [payload.new as NotificationRow, ...prev].slice(0, 20))
        )
        .subscribe()
    })()
    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [userId, supabase, instanceId])

  async function markRead(ids: string[]) {
    if (ids.length === 0) return
    setItems((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n)))
    await supabase.from("notifications").update({ is_read: true }).in("id", ids)
  }

  async function handleClick(n: NotificationRow) {
    if (!n.is_read) markRead([n.id])
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  if (!userId) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative h-9 w-9 rounded-full bg-muted hover:bg-muted/80", className)}
          aria-label={`Мэдэгдэл${unread ? ` (${unread} шинэ)` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-saffron px-1 text-[10px] font-black leading-none text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-bold text-foreground">Мэдэгдэл</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markRead(items.filter((n) => !n.is_read).map((n) => n.id))}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Check className="h-3 w-3" /> Бүгдийг уншсан
            </button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Одоогоор мэдэгдэл алга.
            </p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleClick(n)}
                className={cn(
                  "flex w-full items-start gap-2.5 border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-secondary",
                  !n.is_read && "bg-tint-sky/40"
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    n.is_read ? "bg-transparent" : "bg-saffron"
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{n.title}</span>
                  {n.body && <span className="block text-xs text-muted-foreground">{n.body}</span>}
                  <span className="mt-0.5 block text-[10px] text-muted-foreground/70">
                    {relativeTime(n.created_at)}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
