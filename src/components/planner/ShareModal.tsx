"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Share2, Copy, Check, UserPlus, Trash2, Link as LinkIcon } from "lucide-react"

interface ShareModalProps {
  tripId: string | null
  isLoggedIn: boolean
  // Only the owner can manage collaborators (enforced by RLS either way —
  // this just hides UI that would be rejected).
  isOwner?: boolean
  // Custom trigger element (e.g. the labeled footer pill); falls back to the
  // plain icon button. Pass `null` to render no trigger (controlled mode).
  trigger?: React.ReactNode
  // Controlled open state — used when the dialog is opened from elsewhere
  // (e.g. the header participants popover's "invite" button). Omit both for
  // the default self-triggered behavior.
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface CollaboratorRow {
  id: string
  invited_email: string
  role: "editor" | "viewer"
  status: "pending" | "accepted"
}

export function ShareModal({
  tripId,
  isLoggedIn,
  isOwner = true,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: ShareModalProps) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isControlled ? controlledOpen : internalOpen

  const [isPublic, setIsPublic] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const [collaborators, setCollaborators] = useState<CollaboratorRow[]>([])
  // Flips false if trip_collaborators isn't queryable (migration 0008 not
  // applied yet) so we don't show a form whose insert can only fail.
  const [invitesSupported, setInvitesSupported] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor")
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null)

  const shareUrl =
    tripId && typeof window !== "undefined"
      ? `${window.location.origin}/planner/shared/${tripId}`
      : ""

  const inviteUrl = (collaboratorId: string) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/planner/invite/${collaboratorId}`
      : ""

  // Orchestrates open state (controlled or internal) plus the one-time data
  // load when the dialog is first opened.
  function setOpen(next: boolean) {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
    if (next) loadShareData()
  }

  async function loadShareData() {
    if (!tripId || loaded) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("itineraries")
      .select("is_public")
      .eq("id", tripId)
      .single()
    setIsPublic(!!data?.is_public)

    if (isOwner) {
      const { data: collabs, error } = await supabase
        .from("trip_collaborators")
        .select("id, invited_email, role, status")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true })
      if (error) {
        setInvitesSupported(false)
      } else {
        setCollaborators((collabs ?? []) as CollaboratorRow[])
      }
    }

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

  async function handleInvite() {
    const email = inviteEmail.trim().toLowerCase()
    if (!tripId || !email || !email.includes("@")) return
    setInviteLoading(true)
    setInviteError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setInviteError("Нэвтэрсэн байх шаардлагатай.")
      setInviteLoading(false)
      return
    }
    const { data, error } = await supabase
      .from("trip_collaborators")
      .insert({ trip_id: tripId, invited_email: email, role: inviteRole, invited_by: user.id })
      .select("id, invited_email, role, status")
      .single()
    if (error) {
      setInviteError(
        error.code === "23505"
          ? "Энэ имэйл рүү аль хэдийн урилга илгээсэн байна."
          : "Урилга үүсгэж чадсангүй. Дахин оролдоно уу."
      )
    } else if (data) {
      setCollaborators((prev) => [...prev, data as CollaboratorRow])
      setInviteEmail("")
    }
    setInviteLoading(false)
  }

  async function handleRemove(collaboratorId: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from("trip_collaborators")
      .delete()
      .eq("id", collaboratorId)
    if (!error) {
      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId))
    }
  }

  async function handleCopyInvite(collaboratorId: string) {
    await navigator.clipboard.writeText(inviteUrl(collaboratorId))
    setCopiedInviteId(collaboratorId)
    setTimeout(() => setCopiedInviteId(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* trigger === null → controlled/no trigger; undefined → default button */}
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              title="Хуваалцах"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Аяллаа хуваалцах</DialogTitle>
          <DialogDescription>
            Зөвхөн харах холбоос илгээх, эсвэл найзаа хамтран засварлагчаар урь.
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

            {isOwner && invitesSupported && (
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Хамтрагч урих</p>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="naiz@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                    className="text-sm flex-1"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "editor" | "viewer")}
                    className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
                  >
                    <option value="editor">Засварлагч</option>
                    <option value="viewer">Үзэгч</option>
                  </select>
                  <Button size="sm" onClick={handleInvite} disabled={inviteLoading}>
                    Урих
                  </Button>
                </div>
                {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}

                {collaborators.length > 0 && (
                  <div className="space-y-1.5">
                    {collaborators.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 text-xs">
                        <span className="flex-1 truncate font-mono">{c.invited_email}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {c.role === "editor" ? "Засварлагч" : "Үзэгч"}
                        </Badge>
                        <Badge
                          variant={c.status === "accepted" ? "default" : "secondary"}
                          className="text-[10px] shrink-0"
                        >
                          {c.status === "accepted" ? "Нэгдсэн" : "Хүлээгдэж буй"}
                        </Badge>
                        {c.status === "pending" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 shrink-0"
                            onClick={() => handleCopyInvite(c.id)}
                            title="Урилгын холбоос хуулах"
                          >
                            {copiedInviteId === c.id ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <LinkIcon className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 shrink-0 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(c.id)}
                          title="Устгах"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground">
                  Урилгын холбоосыг хуулаад найздаа өөрөө илгээгээрэй — тухайн имэйлээр
                  нэвтэрсэн хүн л урилгыг хүлээн авч чадна.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
