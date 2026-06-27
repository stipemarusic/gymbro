import { getSessionCookie } from "better-auth/cookies"
import { NextRequest, NextResponse } from "next/server"

const publicAuthPaths = new Set(["/", "/sign-in", "/sign-up"])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)
  const isLoggedIn = Boolean(sessionCookie)
  const isDashboardPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")

  if (!isLoggedIn && isDashboardPath) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (isLoggedIn && publicAuthPaths.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
}
