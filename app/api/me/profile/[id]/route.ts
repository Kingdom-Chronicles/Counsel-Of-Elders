import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { db } from "@/lib/db"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Await the params to access id
    const userId = await params.id; // Await the params object

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("Fetching profile for userId:", userId)

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: {
          include: {
            categories: true,
            experiences: true,
          },
        },
      },
    })

    if (!user) {
      console.log("User not found for ID:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Found user:", user)

    // Transform data for the frontend
    const profileData = {
      name: user.name,
      email: user.email,
      image: user.image,
      title: user.profile?.title || "",
      bio: user.profile?.bio || "",
      experience: user.profile?.experience || 0,
      coverImage: user.profile?.coverImage || "",
      expertise: user.profile?.expertise || [],
      categories: user.profile?.categories.map((c) => c.name) || [],
      experiences:
        user.profile?.experiences.map((exp) => ({
          role: exp.role,
          company: exp.company,
          period: exp.period,
          description: exp.description,
        })) || [],
    }

    console.log("Returning profile data:", profileData)
    return NextResponse.json(profileData)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}