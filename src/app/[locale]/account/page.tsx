import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/auth/SignOutButton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Inbox } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ProfileRow } from "@/lib/supabase/types"

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirectTo=/account")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<ProfileRow>()

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-2xl">My account</CardTitle>
            {profile?.role === "admin" && <Badge>Admin</Badge>}
            {profile?.role === "guide" && <Badge variant="secondary">Guide</Badge>}
          </div>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name: </span>
            {profile?.full_name || "—"}
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          {profile?.role === "admin" && (
            <Button asChild>
              <Link href="/admin">Go to admin dashboard</Link>
            </Button>
          )}
          {profile?.role === "guide" && (
            <Button asChild variant="outline">
              <Link href="/account/messages">
                <Inbox className="h-4 w-4" /> Ирсэн зурвасууд
              </Link>
            </Button>
          )}
          <SignOutButton />
        </CardFooter>
      </Card>
    </div>
  )
}
