import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getSession } from "next-auth/react"


export async function GET() {
  const session = await getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
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
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

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

  return NextResponse.json(profileData)
}

