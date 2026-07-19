import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Props {
  params: Promise<{ id: string }>
}

// Invite-accept flow for trip collaboration (see 0008_trip_collaborators.sql).
// The claim runs as the logged-in user with the normal session-bound client —
// no admin client needed, because the trip_collaborators_update RLS policy
// already allows a user to update a pending row addressed to their own email.
export default async function PlannerInvitePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirectTo=/planner/invite/${id}`)
  }

  // RLS only returns the row if it's addressed to this user's email, already
  // claimed by them, or they own the trip — anyone else sees "not found".
  const { data: invite } = await supabase
    .from("trip_collaborators")
    .select("id, trip_id, invited_email, user_id, status")
    .eq("id", id)
    .maybeSingle()

  if (invite) {
    if (invite.status === "pending") {
      await supabase
        .from("trip_collaborators")
        .update({ user_id: user.id, status: "accepted" })
        .eq("id", id)
        .eq("invited_email", user.email)
        .eq("status", "pending")

      // Re-read instead of trusting the update blindly: a zero-row update
      // (email mismatch) should fall through to the error card below.
      const { data: claimed } = await supabase
        .from("trip_collaborators")
        .select("status, user_id")
        .eq("id", id)
        .maybeSingle()

      if (claimed?.status === "accepted" && claimed.user_id === user.id) {
        redirect(`/planner?trip=${invite.trip_id}`)
      }
    } else if (invite.user_id === user.id) {
      // Already accepted by this user — just go to the trip.
      redirect(`/planner?trip=${invite.trip_id}`)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6 space-y-4">
          <p className="text-muted-foreground">
            Энэ урилга олдсонгүй, эсвэл өөр имэйл хаяг руу илгээгдсэн байна.
            Урилга авсан имэйлээрээ нэвтэрсэн эсэхээ шалгаарай.
          </p>
          <p className="text-xs text-muted-foreground">
            Таны нэвтэрсэн хаяг: <span className="font-mono">{user.email}</span>
          </p>
          <Button asChild variant="outline">
            <Link href="/planner">Аялал төлөвлөгч рүү буцах</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
