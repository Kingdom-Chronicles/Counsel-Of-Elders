import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  const isMentor = token?.role === "MENTOR"
  const isMentee = token?.role === "MENTEE"

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/signup", "/about", "/how-it-works", "/contact"]

  // Check if the path is public
  if (publicPaths.some((path) => request.nextUrl.pathname === path)) {
    return NextResponse.next()
  }

  // Paths that require mentor role
  const mentorPaths = ["/mentor-portal", "/mentor-messages"]
  if (mentorPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (!isMentor) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Paths that require mentee role
  const menteePaths = ["/dashboard", "/mentors", "/messages"]
  if (menteePaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (!isMentee) {
      return NextResponse.redirect(new URL("/mentor-portal", request.url))
    }
    return NextResponse.next()
  }

  // Default: require authentication for all other routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes that handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}

