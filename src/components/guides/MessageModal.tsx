"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface MessageModalProps {
  guideId: string
  guideName: string
  trigger: React.ReactNode
}

export function MessageModal({ guideId, guideName, trigger }: MessageModalProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleOpenChange(open: boolean) {
    if (!open) return
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    setIsLoggedIn(!!data.user)
    setError(null)
    setSent(false)
  }

  async function handleSend() {
    if (!body.trim()) {
      setError("Зурвасны агуулга хоосон байна.")
      return
    }
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setIsLoggedIn(false)
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from("messages").insert({
      guide_id: guideId,
      sender_id: userData.user.id,
      type: "message",
      body,
    })

    setSubmitting(false)

    if (insertError) {
      setError("Зурвас илгээхэд алдаа гарлаа. Дахин оролдоно уу.")
      return
    }

    setSent(true)
    setBody("")
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{guideName}-д зурвас бичих</DialogTitle>
          <DialogDescription>
            Хөтөч тантай шууд холбогдох болно.
          </DialogDescription>
        </DialogHeader>

        {isLoggedIn === false ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Зурвас илгээхийн тулд эхлээд бүртгэлдээ нэвтэрнэ үү.
            </p>
            <Button asChild className="w-full">
              <Link href="/login?redirectTo=/guides">Нэвтрэх</Link>
            </Button>
          </div>
        ) : sent ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-foreground">
              Зурвас амжилттай илгээгдлээ. Хөтөч удахгүй тантай холбогдох болно.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-2 py-2">
              <Label htmlFor="message-body">Зурвас</Label>
              <Textarea
                id="message-body"
                placeholder="Сайн байна уу, би..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button onClick={handleSend} disabled={submitting} className="w-full">
                {submitting ? "Илгээж байна…" : "Илгээх"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
