import { type NextRequest, NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getSession } from "next-auth/react"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const conversations = await db.message.findMany({
    where: {
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
    },
    include: {
      sender: {
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
      receiver: {
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
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Group messages by conversation
  const conversationMap = new Map()

  for (const message of conversations) {
    const otherUser = message.senderId === session.user.id ? message.receiver : message.sender
    const conversationId = otherUser.id

    if (!conversationMap.has(conversationId)) {
      conversationMap.set(conversationId, {
        id: conversationId,
        name: otherUser.name,
        title: otherUser.profile?.title || "",
        avatar: otherUser.image,
        lastMessage: message.content,
        lastMessageTime: message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        unread: message.receiverId === session.user.id && !message.read,
        messages: [],
      })
    }

    conversationMap.get(conversationId).messages.push({
      id: message.id,
      sender: message.senderId === session.user.id ? "me" : "other",
      text: message.content,
      time: message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: message.read,
    })
  }

  // Sort messages within each conversation by time
  for (const conversation of conversationMap.values()) {
    conversation.messages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
  }

  return NextResponse.json(Array.from(conversationMap.values()))
}

