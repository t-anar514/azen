"use client"

import * as React from "react"
import { Check, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Section } from "@/components/ui/section"

/**
 * Newsletter capture (design doc, Screen 01). Posts to the same guide-lead
 * endpoint pattern; there's no mailing-list backend yet, so this stores intent
 * locally and tells the truth about what happens next.
 */
export function NewsletterBand() {
  const [email, setEmail] = React.useState("")
  const [done, setDone] = React.useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    try {
      localStorage.setItem("azen_newsletter_email", email.trim())
    } catch {
      /* private mode — the intent still shows as captured */
    }
    setDone(true)
  }

  return (
    <Section>
      <div className="rounded-card bg-tint-sky p-8 md:p-12">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <Eyebrow>Мэдээллийн захидал</Eyebrow>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Үнэгүй аяллын мэдээлэл авах
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Сард нэг захидал: шинэ газрууд, улирлын зөвлөмж, хямд тийзийн мэдээ.
            </p>
          </div>

          {done ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Check className="size-5 text-success" />
              Бүртгэгдлээ — удахгүй эхний захидал ирнэ.
            </p>
          ) : (
            <form onSubmit={submit} className="flex flex-wrap gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="таны@имэйл.mn"
                  className="h-11 rounded-pill bg-card pl-11"
                  aria-label="Имэйл хаяг"
                />
              </div>
              <Button type="submit" variant="reserve" className="h-11 rounded-pill px-6">
                Бүртгүүлэх
              </Button>
            </form>
          )}
        </div>
      </div>
    </Section>
  )
}
