"use client"

import { useState } from "react"
import Link from "next/link"
import { Send } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-xl font-bold">Counsel of Elders</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/mentors">
            Mentors
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/messages">
            Messages
          </Link>
        </nav>
        <div className="ml-4">
          <Link href="/profile">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-80 border-r md:h-[calc(100vh-4rem)] overflow-hidden">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          <Tabs defaultValue="all" className="w-full">
            <div className="px-4 pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="m-0">
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      className={`w-full flex items-start gap-3 p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        selectedConversation.id === conversation.id ? "bg-gray-100 dark:bg-gray-800" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <Avatar>
                        <AvatarImage src={conversation.avatar} alt={conversation.name} />
                        <AvatarFallback>
                          {conversation.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium truncate">{conversation.name}</p>
                          <p className="text-xs text-gray-500">{conversation.lastMessageTime}</p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread && <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="divide-y">
                  {conversations
                    .filter((c) => c.unread)
                    .map((conversation) => (
                      <button
                        key={conversation.id}
                        className={`w-full flex items-start gap-3 p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          selectedConversation.id === conversation.id ? "bg-gray-100 dark:bg-gray-800" : ""
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <Avatar>
                          <AvatarImage src={conversation.avatar} alt={conversation.name} />
                          <AvatarFallback>
                            {conversation.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-medium truncate">{conversation.name}</p>
                            <p className="text-xs text-gray-500">{conversation.lastMessageTime}</p>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      </button>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                  <AvatarFallback>
                    {selectedConversation.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedConversation.name}</p>
                  <p className="text-sm text-gray-500">{selectedConversation.title}</p>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message, index) => (
                    <div key={index} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                      {message.sender !== "me" && (
                        <Avatar className="mr-2 mt-1">
                          <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                          <AvatarFallback>
                            {selectedConversation.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div
                          className={`max-w-md rounded-lg px-4 py-2 ${
                            message.sender === "me"
                              ? "bg-primary text-primary-foreground"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          <p>{message.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                      </div>
                      {message.sender === "me" && (
                        <Avatar className="ml-2 mt-1">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <form className="flex items-center gap-2">
                  <Input placeholder="Type your message..." className="flex-1" />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="mx-auto max-w-md">
                <CardHeader>
                  <h2 className="text-xl font-bold text-center">Select a conversation</h2>
                </CardHeader>
                <CardContent className="text-center text-gray-500">
                  Choose a conversation from the sidebar to start messaging
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Sample data
const conversations = [
  {
    id: "1",
    name: "David Wilson",
    title: "Business Strategist & Faith Leader",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Looking forward to our session tomorrow!",
    lastMessageTime: "10:30 AM",
    unread: true,
    messages: [
      {
        sender: "other",
        text: "Hello John, I hope you're doing well today.",
        time: "10:15 AM",
      },
      {
        sender: "me",
        text: "Hi David, I'm doing great. Just preparing for our session.",
        time: "10:20 AM",
      },
      {
        sender: "other",
        text: "Excellent! I've reviewed your questions and have some thoughts to share.",
        time: "10:25 AM",
      },
      {
        sender: "other",
        text: "Looking forward to our session tomorrow!",
        time: "10:30 AM",
      },
    ],
  },
  {
    id: "2",
    name: "Michael Johnson",
    title: "Relationship Coach & Family Counselor",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "That's a great question. Let me think about it and get back to you.",
    lastMessageTime: "Yesterday",
    unread: false,
    messages: [
      {
        sender: "me",
        text: "Hi Michael, I have a question about something we discussed in our last session.",
        time: "Yesterday, 3:45 PM",
      },
      {
        sender: "other",
        text: "Of course, what's on your mind?",
        time: "Yesterday, 4:00 PM",
      },
      {
        sender: "me",
        text: "You mentioned strategies for improving communication in relationships. Could you elaborate on the active listening technique?",
        time: "Yesterday, 4:05 PM",
      },
      {
        sender: "other",
        text: "That's a great question. Let me think about it and get back to you.",
        time: "Yesterday, 4:15 PM",
      },
    ],
  },
  {
    id: "3",
    name: "James Thompson",
    title: "Faith Leader & Community Builder",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I'll send you those resources we talked about.",
    lastMessageTime: "Mar 15",
    unread: true,
    messages: [
      {
        sender: "other",
        text: "Hello John, following up on our session yesterday.",
        time: "Mar 15, 9:00 AM",
      },
      {
        sender: "me",
        text: "Hi James, thanks for checking in.",
        time: "Mar 15, 9:15 AM",
      },
      {
        sender: "other",
        text: "I'll send you those resources we talked about.",
        time: "Mar 15, 9:20 AM",
      },
    ],
  },
]

