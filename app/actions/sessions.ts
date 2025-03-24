"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/lib/db"
import { auth } from "@/auth"

const sessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  mentorId: z.string().min(1, "Mentor is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  format: z.string().min(1, "Format is required"),
  topics: z.string().optional(),
  message: z.string().optional(),
})

export async function scheduleSession(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    return {
      error: "Not authenticated",
    }
  }

  const validatedFields = sessionSchema.safeParse({
    title: formData.get("title"),
    mentorId: formData.get("mentorId"),
    date: formData.get("date"),
    time: formData.get("time"),
    format: formData.get("format"),
    topics: formData.get("topics"),
    message: formData.get("message"),
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, mentorId, date, time, format, topics, message } = validatedFields.data

  // Create session
  await db.mentorshipSession.create({
    data: {
      title,
      mentorId,
      menteeId: session.user.id,
      date: new Date(date),
      time,
      format,
      topics,
      message,
      status: "PENDING",
    },
  })

  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateSessionStatus(sessionId: string, status: "CONFIRMED" | "CANCELLED" | "COMPLETED") {
  const session = await auth()

  if (!session || !session.user) {
    return {
      error: "Not authenticated",
    }
  }

  const mentorshipSession = await db.mentorshipSession.findUnique({
    where: {
      id: sessionId,
    },
  })

  if (!mentorshipSession) {
    return {
      error: "Session not found",
    }
  }

  // Check if user is the mentor for this session
  if (mentorshipSession.mentorId !== session.user.id) {
    return {
      error: "Not authorized",
    }
  }

  await db.mentorshipSession.update({
    where: {
      id: sessionId,
    },
    data: {
      status,
    },
  })

  revalidatePath("/mentor-portal")
  revalidatePath("/dashboard")
  return { success: true }
}

