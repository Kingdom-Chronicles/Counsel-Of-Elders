import { type NextRequest, NextResponse } from "next/server"

import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

  const whereClause: any = {
    user: {
      role: "MENTOR",
    },
  }

  if (category && category !== "all") {
    whereClause.categories = {
      some: {
        name: category,
      },
    }
  }

  if (search) {
    whereClause.OR = [
      {
        user: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        bio: {
          contains: search,
          mode: "insensitive",
        },
      },
    ]
  }

  const mentors = await db.profile.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      categories: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    take: limit,
    orderBy: {
      // Order by most reviewed mentors first
      reviews: {
        _count: "desc",
      },
    },
  })

  // Transform data for the frontend
  const transformedMentors = mentors.map((mentor) => {
    const avgRating =
      mentor.reviews.length > 0
        ? mentor.reviews.reduce((acc, review) => acc + review.rating, 0) / mentor.reviews.length
        : 0

    return {
      id: mentor.user.id,
      name: mentor.user.name,
      title: mentor.title,
      bio: mentor.bio,
      avatar: mentor.user.image || "/placeholder.svg?height=40&width=40",
      coverImage: mentor.coverImage,
      categories: mentor.categories.map((c) => c.name),
      expertise: mentor.expertise || [],
      experience: mentor.experience || 0,
      sessions: mentor.reviews.length,
      rating: avgRating,
    }
  })

  return NextResponse.json(transformedMentors)
}

