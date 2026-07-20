"use client"

import * as React from "react"
import { Link, useRouter } from "@/i18n/routing"
import { User, LayoutDashboard, Inbox, LogOut, Car, Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Role = "user" | "guide" | "admin" | "driver" | null

interface AccountMenuProps {
  className?: string
  variant?: "desktop" | "mobile"
}

// Account/auth indicator for the Navbar. Deliberately split from the content
// nav links (Guides/Planner/Hacks/.../Learn) so it doesn't read as just another
// tab in that row — on desktop it's an icon-trigger dropdown, on mobile it's an
// inline block already separated by a divider in the Sheet menu.
export function AccountMenu({ className, variant = "desktop" }: AccountMenuProps) {
  const router = useRouter()
  const [email, setEmail] = React.useState<string | null>(null)
  const [role, setRole] = React.useState<Role>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const supabase = createClient()

    async function loadProfile(userId: string | undefined, userEmail: string | undefined) {
      if (!userId) {
        setEmail(null)
        setRole(null)
        setLoading(false)
        return
      }
      setEmail(userEmail ?? null)
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).single()
      setRole((data?.role as Role) ?? "user")
      setLoading(false)
    }

    supabase.auth.getUser().then(({ data }) => {
      loadProfile(data.user?.id, data.user?.email)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user?.id, session?.user?.email)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return <div className={cn("h-9 w-9", className)} />
  }

  const isLoggedIn = !!email

  if (variant === "mobile") {
    if (!isLoggedIn) {
      return (
        <div className={cn("flex flex-col gap-1", className)}>
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <User className="h-4 w-4 text-accent" /> Нэвтрэх
          </Link>
        </div>
      )
    }
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <Link
          href="/account"
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <User className="h-4 w-4 text-accent" /> Миний бүртгэл
        </Link>
        <Link
          href="/account/saved"
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <Heart className="h-4 w-4 text-accent" /> Хадгалсан
        </Link>
        {role === "guide" && (
          <Link
            href="/account/messages"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <Inbox className="h-4 w-4 text-accent" /> Ирсэн зурвасууд
          </Link>
        )}
        {role === "driver" && (
          <Link
            href="/driver"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <Car className="h-4 w-4 text-accent" /> Жолоочийн самбар
          </Link>
        )}
        {role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <LayoutDashboard className="h-4 w-4 text-accent" /> Админ самбар
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold text-destructive transition-colors hover:bg-muted text-left"
        >
          <LogOut className="h-4 w-4" /> Гарах
        </button>
      </div>
    )
  }

  // Desktop variant
  if (!isLoggedIn) {
    return (
      <Button asChild size="sm" variant="outline" className={cn("rounded-full", className)}>
        <Link href="/login">Нэвтрэх</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9 rounded-full bg-muted hover:bg-muted/80", className)}
        >
          <User className="h-4 w-4" />
          <span className="sr-only">Account menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
          {email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <User className="h-4 w-4" /> Миний бүртгэл
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/saved" className="cursor-pointer">
            <Heart className="h-4 w-4" /> Хадгалсан
          </Link>
        </DropdownMenuItem>
        {role === "guide" && (
          <DropdownMenuItem asChild>
            <Link href="/account/messages" className="cursor-pointer">
              <Inbox className="h-4 w-4" /> Ирсэн зурвасууд
            </Link>
          </DropdownMenuItem>
        )}
        {role === "driver" && (
          <DropdownMenuItem asChild>
            <Link href="/driver" className="cursor-pointer">
              <Car className="h-4 w-4" /> Жолоочийн самбар
            </Link>
          </DropdownMenuItem>
        )}
        {role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <LayoutDashboard className="h-4 w-4" /> Админ самбар
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
          <LogOut className="h-4 w-4" /> Гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
