import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()

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

  // Get the user's profile
  const profile = await db.profile.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      availability: true,
    },
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json(profile.availability)
}

