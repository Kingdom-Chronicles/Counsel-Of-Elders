"use server"

import { google } from "googleapis"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/lib/db"
import { getSession } from "next-auth/react"

// Create a new OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
)

// Set credentials if we have a refresh token
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  })
}

const meetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  mentorId: z.string().min(1, "Mentor is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.coerce.number().min(15, "Duration must be at least 15 minutes"),
  topics: z.string().optional(),
})

export async function createMeetingWithGoogleMeet(formData: FormData) {
  const session = await getSession()

  if (!session || !session.user) {
    return {
      error: "Not authenticated",
    }
  }

  const validatedFields = meetingSchema.safeParse({
    title: formData.get("title"),
    mentorId: formData.get("mentorId"),
    date: formData.get("date"),
    time: formData.get("time"),
    duration: formData.get("duration") || 60,
    topics: formData.get("topics"),
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, mentorId, date, time, duration, topics } = validatedFields.data

  try {
    // Create Google Calendar event with Google Meet
    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    // Parse date and time
    const [year, month, day] = date.split("-").map(Number)
    const [hour, minute] = time.split(":").map(Number)

    const startDateTime = new Date(year, month - 1, day, hour, minute)
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

    // Get mentor and mentee details
    const mentor = await db.user.findUnique({
      where: { id: mentorId },
      select: { name: true, email: true },
    })

    const mentee = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    })

    if (!mentor || !mentee) {
      return {
        error: "User not found",
      }
    }

    // Create the event
    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: title,
        description: topics ? `Topics: ${topics}` : "",
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: "UTC",
        },
        attendees: [{ email: mentor.email }, { email: mentee.email }],
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      },
      conferenceDataVersion: 1,
    })

    // Get the Google Meet link
    const meetLink =
      event.data.conferenceData?.entryPoints?.find((entryPoint) => entryPoint.entryPointType === "video")?.uri || ""

    // Create session in database
    await db.mentorshipSession.create({
      data: {
        title,
        mentorId,
        menteeId: session.user.id,
        date: startDateTime,
        time,
        duration,
        format: "Video Call (Google Meet)",
        topics,
        status: "PENDING",
        meetingLink: meetLink,
        googleEventId: event.data.id,
      },
    })

    revalidatePath("/dashboard")
    return {
      success: true,
      meetLink,
    }
  } catch (error) {
    console.error("Error creating Google Meet:", error)
    return {
      error: "Failed to create meeting. Please try again.",
    }
  }
}

export async function updateSessionStatus(sessionId: string, status: "CONFIRMED" | "CANCELLED" | "COMPLETED") {
  const session = await getSession()

  if (!session || !session.user) {
    return {
      error: "Not authenticated",
    }
  }

  const mentorshipSession = await db.mentorshipSession.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      mentorId: true,
      googleEventId: true,
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

  try {
    // Update Google Calendar event status if we have an event ID
    if (mentorshipSession.googleEventId) {
      const calendar = google.calendar({ version: "v3", auth: oauth2Client })

      if (status === "CANCELLED") {
        // Cancel the event
        await calendar.events.update({
          calendarId: "primary",
          eventId: mentorshipSession.googleEventId,
          requestBody: {
            status: "cancelled",
          },
        })
      } else if (status === "CONFIRMED") {
        // Update the event status (e.g., change color or add confirmation to description)
        const event = await calendar.events.get({
          calendarId: "primary",
          eventId: mentorshipSession.googleEventId,
        })

        await calendar.events.update({
          calendarId: "primary",
          eventId: mentorshipSession.googleEventId,
          requestBody: {
            ...event.data,
            description: `${event.data.description || ""}\n\nStatus: CONFIRMED`,
            colorId: "2", // Green
          },
        })
      }
    }

    // Update session in database
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
  } catch (error) {
    console.error("Error updating session status:", error)
    return {
      error: "Failed to update session status. Please try again.",
    }
  }
}

