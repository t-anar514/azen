import createMiddleware from "next-intl/middleware"
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { routing } from "./i18n/routing"

const handleI18nRouting = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  // The Supabase auth callback lives outside the [locale] segment on purpose
  // (it's a Route Handler, not a page). Let it through untouched — running it
  // through next-intl's routing would rewrite it to /mn/auth/callback, which
  // doesn't exist, and produce a 404 before the code-exchange ever runs.
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  // Run the existing next-intl routing first; this is the response we'll
  // attach the refreshed Supabase auth cookies to and (usually) return.
  const response = handleI18nRouting(request)

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: always call getUser() (not getSession()) — it re-validates the
  // token against Supabase rather than just trusting the cookie.
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/")

  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // /driver/apply only requires being logged in (that's how someone becomes
  // a driver in the first place). Everything else under /driver/* needs an
  // approved driver — or admin — role; redirect non-drivers to apply instead
  // of bouncing them home, since that's the obvious next step for them.
  const isDriverRoute = pathname === "/driver" || pathname.startsWith("/driver/")
  const isDriverApplyRoute = pathname === "/driver/apply"

  if (isDriverRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (!isDriverApplyRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "driver" && profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/driver/apply", request.url))
      }
    }
  }

  return response
}

export const config = {
  // Match all pathnames for internationalized routing,
  // but ignore non-page requests like API, auth callback, static files and images
  matcher: ["/((?!api|auth|_next|.*\\..*).*)"],
}
