"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/lib/db"
import { getSession } from "next-auth/react"

const messageSchema = z.object({
  content: z.string().min(1, "Message is required"),
  receiverId: z.string().min(1, "Receiver is required"),
})

export async function sendMessage(formData: FormData) {
  const session = await getSession()

  if (!session || !session.user) {
    return {
      error: "Not authenticated",
    }
  }

  const validatedFields = messageSchema.safeParse({
    content: formData.get("content"),
    receiverId: formData.get("receiverId"),
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { content, receiverId } = validatedFields.data

  // Create message
  await db.message.create({
    data: {
      content,
      senderId: session.user.id,
      receiverId,
    },
  })

  revalidatePath("/messages")
  revalidatePath("/mentor-messages")
  return { success: true }
}

export async function markMessageAsRead(messageId: string) {
  const session = await getSession()

  if (!session || !session.user) {
    return {
      error: "Not authenticated",
    }
  }

  const message = await db.message.findUnique({
    where: {
      id: messageId,
    },
  })

  if (!message) {
    return {
      error: "Message not found",
    }
  }

  // Check if user is the receiver of this message
  if (message.receiverId !== session.user.id) {
    return {
      error: "Not authorized",
    }
  }

  await db.message.update({
    where: {
      id: messageId,
    },
    data: {
      read: true,
    },
  })

  revalidatePath("/messages")
  revalidatePath("/mentor-messages")
  return { success: true }
}

