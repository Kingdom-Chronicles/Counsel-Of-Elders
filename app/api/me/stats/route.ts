import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getSession } from "next-auth/react"

export async function GET() {
  const session = await getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Check if user is a mentor
  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
      role: "MENTOR",
    },
  })

  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  // Get active mentees (mentees with at least one session in the last 3 months)
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const activeMenteesCount = await db.user.count({
    where: {
      menteeSessions: {
        some: {
          mentorId: session.user.id,
          date: {
            gte: threeMonthsAgo,
          },
        },
      },
    },
  })

  // Get completed sessions count
  const completedSessionsCount = await db.mentorshipSession.count({
    where: {
      mentorId: session.user.id,
      status: "COMPLETED",
    },
  })

  // Get total hours of mentorship
  const sessions = await db.mentorshipSession.findMany({
    where: {
      mentorId: session.user.id,
      status: "COMPLETED",
    },
    select: {
      duration: true,
    },
  })

  const totalHours = sessions.reduce((total, session) => total + session.duration / 60, 0)

  // Get average rating
  const profile = await db.profile.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  })

  const averageRating = profile?.reviews.length
    ? profile.reviews.reduce((total, review) => total + review.rating, 0) / profile.reviews.length
    : 0

  return NextResponse.json({
    activeMentees: activeMenteesCount,
    sessionsCompleted: completedSessionsCount,
    hoursOfMentorship: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
  })
}

