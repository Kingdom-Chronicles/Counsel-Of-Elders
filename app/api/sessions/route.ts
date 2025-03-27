import { type NextRequest, NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getSession } from "next-auth/react"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")
  const role = searchParams.get("role") || session.user.role.toLowerCase()

  const whereClause: any = {}

  if (role === "mentor") {
    whereClause.mentorId = session.user.id
  } else {
    whereClause.menteeId = session.user.id
  }

  if (status) {
    whereClause.status = status.toUpperCase()
  }

  const sessions = await db.mentorshipSession.findMany({
    where: whereClause,
    include: {
      mentor: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: {
            select: {
              title: true,
            },
          },
        },
      },
      mentee: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      categories: true,
    },
    orderBy: {
      date: "asc",
    },
  })

  // Transform data for the frontend
  const transformedSessions = sessions.map((session) => {
    return {
      id: session.id,
      title: session.title,
      date: session.date.toLocaleDateString(),
      time: session.time,
      format: session.format,
      topics: session.topics,
      status: session.status,
      message: session.message,
      mentor: {
        id: session.mentor.id,
        name: session.mentor.name,
        avatar: session.mentor.image,
        title: session.mentor.profile?.title,
      },
      mentee: {
        id: session.mentee.id,
        name: session.mentee.name,
        avatar: session.mentee.image,
        age: 30, // This would come from a profile field in a real app
      },
      categories: session.categories.map((c) => c.name),
    }
  })

  return NextResponse.json(transformedSessions)
}

