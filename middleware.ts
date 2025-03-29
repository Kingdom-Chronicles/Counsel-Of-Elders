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

  // Onboarding paths
  const onboardingPaths = ["/onboarding/mentor", "/onboarding/mentee"]

  // Check if the path is public or onboarding
  if (
    publicPaths.some((path) => request.nextUrl.pathname === path) ||
    onboardingPaths.some((path) => request.nextUrl.pathname === path)
  ) {
    return NextResponse.next()
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Check if user needs onboarding
  const needsOnboarding = await checkIfNeedsOnboarding(token)

  if (needsOnboarding) {
    // Don't redirect if already on onboarding page
    if (onboardingPaths.some((path) => request.nextUrl.pathname === path)) {
      return NextResponse.next()
    }

    // Redirect to appropriate onboarding page
    if (isMentor) {
      return NextResponse.redirect(new URL("/onboarding/mentor", request.url))
    } else if (isMentee) {
      return NextResponse.redirect(new URL("/onboarding/mentee", request.url))
    }
  }

  // Paths that require mentor role
  const mentorPaths = ["/mentor-portal", "/mentor-messages"]
  if (mentorPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    if (!isMentor) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Paths that require mentee role
  const menteePaths = ["/dashboard", "/mentors", "/messages"]
  if (menteePaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    if (!isMentee) {
      return NextResponse.redirect(new URL("/mentor-portal", request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Helper function to check if user needs onboarding
async function checkIfNeedsOnboarding(token: any): Promise<boolean> {
  if (!token) return true
  console.log("Token in onboarding check:", token)
  
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/me/profile/${token.id}`)

    if (!response.ok) {
      return true
    }

    const data = await response.json()

    console.log("data",data)

    // For mentors, check required fields
    if (token.role === "MENTOR") {
      console.log("check if needs onboarding",!data.title || !data.bio || !data.categories?.length )
      return !data.title || !data.bio || !data.categories?.length 
    }

    // For mentees, check if they have a bio and at least one interest (stored in expertise)
    if (token.role === "MENTEE") {
      console.log("check if mentee needs onboarding", !data.bio || !data.expertise?.length)
      return !data.bio || !data.expertise?.length
    }

    // For mentees, we might have different requirements
    return false
  } catch (error) {
    // If there's an error, assume onboarding is needed
    console.error("Error checking if user needs onboarding:", error)
    return true
  }
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