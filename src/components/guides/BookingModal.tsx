"use client"

import Link from "next/link"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface BookingModalProps {
  guideId: string
  guideName: string
  trigger: React.ReactNode
}

export function BookingModal({ guideId, guideName, trigger }: BookingModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [interest, setInterest] = useState("")
  const [message, setMessage] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
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
      type: "booking",
      body: message,
      interest,
      trip_date: date ? date.toISOString().split("T")[0] : null,
    })

    setSubmitting(false)

    if (insertError) {
      setError("Failed to send request. Please try again.")
      return
    }

    setSent(true)
    setMessage("")
    setInterest("")
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book {guideName}</DialogTitle>
          <DialogDescription>
            Send a booking request. You won&apos;t be charged yet.
          </DialogDescription>
        </DialogHeader>

        {isLoggedIn === false ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Log in to send a booking request.
            </p>
            <Button asChild className="w-full">
              <Link href="/login?redirectTo=/guides">Log in</Link>
            </Button>
          </div>
        ) : sent ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-foreground">
              Request sent! {guideName} will reach out to confirm.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Select Date</Label>
                <div className="border rounded-md p-2 flex justify-center">
                     <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                      />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interest">Main Interest</Label>
                <Input
                  id="interest"
                  placeholder="e.g. Hidden temples, Food tour..."
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message to Guide</Label>
                <Textarea
                  id="message"
                  placeholder="Hi, I'm looking for..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button onClick={handleSend} disabled={submitting} className="w-full">
                {submitting ? "Sending…" : "Send Request"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
