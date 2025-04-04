import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { db } from "@/lib/db"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    // Await the params to access id
    const mentorId = await params.id; // Await the params object

    if (!mentorId) {
      return NextResponse.json({ error: "Mentor ID is required" }, { status: 400 })
    }


    const user = await db.user.findUnique({
      where: {
        id: mentorId,
        role: "MENTOR",
      },
      include: {
        profile: {
          include: {
            categories: true,
            experiences: true,
            reviews: true,
            availability: true,
          },
        },
      },
    })

    if (!user || !user.profile) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 })
    }

    // Transform data for the frontend
    const mentor = {
      id: user.id,
      name: user.name,
      title: user.profile.title,
      bio: user.profile.bio,
      avatar: user.image,
      coverImage: user.profile.coverImage,
      categories: user.profile.categories.map((c) => c.name),
      expertise: user.profile.expertise || [],
      experience: user.profile.experience || 0,
      sessions: user.profile.reviews.length,
      experiences: user.profile.experiences.map((exp) => ({
        role: exp.role,
        company: exp.company,
        period: exp.period,
        description: exp.description,
      })),
      reviews: user.profile.reviews.map((review) => ({
        name: review.authorName,
        rating: review.rating,
        date: review.date.toLocaleDateString(),
        comment: review.comment,
      })),
      availability: user.profile.availability.map((avail) => ({
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
      })),
    }

    return NextResponse.json(mentor)
  } catch (error) {
    console.error("Error fetching mentor profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

