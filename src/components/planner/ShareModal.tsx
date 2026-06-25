"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Share2, Copy, Check } from "lucide-react"

interface ShareModalProps {
  tripId: string | null
  isLoggedIn: boolean
}

export function ShareModal({ tripId, isLoggedIn }: ShareModalProps) {
  const [isPublic, setIsPublic] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl =
    tripId && typeof window !== "undefined"
      ? `${window.location.origin}/planner/shared/${tripId}`
      : ""

  async function handleOpenChange(open: boolean) {
    if (!open || !tripId || loaded) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("itineraries")
      .select("is_public")
      .eq("id", tripId)
      .single()
    setIsPublic(!!data?.is_public)
    setLoaded(true)
    setLoading(false)
  }

  async function togglePublic(next: boolean) {
    if (!tripId) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("itineraries")
      .update({ is_public: next })
      .eq("id", tripId)
    if (!error) setIsPublic(next)
    setLoading(false)
  }

  async function handleCopy() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          title="Хуваалцах"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Аяллаа хуваалцах</DialogTitle>
          <DialogDescription>
            Найзууддаа зөвхөн харах эрхтэй холбоос илгээ.
          </DialogDescription>
        </DialogHeader>

        {!isLoggedIn ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Аяллаа хадгалж, хуваалцахын тулд эхлээд бүртгэлдээ нэвтэрнэ үү.
            </p>
            <Button asChild className="w-full">
              <Link href="/login?redirectTo=/planner">Нэвтрэх</Link>
            </Button>
          </div>
        ) : !tripId ? (
          <p className="text-sm text-muted-foreground py-2">
            Аяллаа хуваалцахаасаа өмнө дор хаяж нэг үйл ажиллагаа нэмж, түр хүлээгээрэй —
            аяллыг автоматаар хадгалах болно.
          </p>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg border p-3 gap-3">
              <div>
                <p className="text-sm font-medium">Нийтэд харагдах</p>
                <p className="text-xs text-muted-foreground">
                  Холбоостой хүн бүр зөвхөн харах боломжтой
                </p>
              </div>
              <Button
                size="sm"
                variant={isPublic ? "default" : "outline"}
                onClick={() => togglePublic(!isPublic)}
                disabled={loading}
              >
                {isPublic ? "Нийтлэгдсэн" : "Нийтлэх"}
              </Button>
            </div>

            {isPublic && (
              <div className="flex items-center gap-2">
                <Input readOnly value={shareUrl} className="text-xs" />
                <Button size="icon" variant="outline" onClick={handleCopy} title="Хуулах">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
