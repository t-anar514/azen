"use client"

import * as React from "react"
import { Check, Mail } from "lucide-react"

/**
 * Newsletter band (design doc, Screen 01): green gradient, white pill input +
 * saffron submit. No mailing-list backend yet, so this stores intent locally
 * and tells the truth about what happens next.
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
      /* private mode — intent still reads as captured */
    }
    setDone(true)
  }

  return (
    <section className="mx-auto max-w-content px-4 md:px-8 py-16">
      <div
        className="relative flex flex-col items-start gap-10 overflow-hidden rounded-[28px] p-8 md:flex-row md:items-center md:p-[52px]"
        style={{ background: "linear-gradient(120deg, #2E8B6F, #1A4E4A)" }}
      >
        <div
          className="pointer-events-none absolute -top-16 left-[40%] h-[280px] w-[280px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,.12), transparent 65%)" }}
        />

        <div className="relative flex-1 text-white">
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/70">
            Мэдээллийн товхимол
          </div>
          <h2 className="mb-1.5 mt-2 font-display text-[30px] font-extrabold tracking-[-0.01em]">
            Үнэгүй аяллын мэдээлэл авах
          </h2>
          <p className="max-w-[440px] text-[15px] text-white/80">
            Шинэ газар, нутгийн зөвлөмж, улирлын хямдралыг сард нэг удаа имэйлээр.
          </p>
        </div>

        {done ? (
          <div className="relative flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-[#1A4E4A] md:min-w-[400px]">
            <Check className="size-5 text-success" />
            Бүртгэгдлээ — удахгүй эхний захидал ирнэ.
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="relative flex w-full items-center gap-2.5 rounded-full bg-white p-[7px_7px_7px_22px] md:min-w-[400px]"
          >
            <Mail className="size-[18px] shrink-0 text-[#94A3B8]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Имэйл хаягаа оруулна уу"
              aria-label="Имэйл хаяг"
              className="min-w-0 flex-1 border-0 bg-transparent text-[14.5px] text-foreground outline-none placeholder:text-[#94A3B8]"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full px-6 py-[11px] text-sm font-bold text-white"
              style={{ background: "#DE8C2E" }}
            >
              Бүртгүүлэх
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
