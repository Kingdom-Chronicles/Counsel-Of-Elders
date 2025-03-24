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

export default function MentorMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-xl font-bold">Counsel of Elders</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/mentor-portal">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/mentor-portal/mentees">
            Mentees
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/mentor-messages">
            Messages
          </Link>
        </nav>
        <div className="ml-4">
          <Link href="/mentor-portal/profile">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
              <AvatarFallback>DW</AvatarFallback>
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
                  <p className="text-sm text-gray-500">{selectedConversation.age} years old</p>
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
                          <AvatarFallback>DW</AvatarFallback>
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
    name: "John Davis",
    age: 28,
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thank you for the advice. I'll try implementing those strategies.",
    lastMessageTime: "10:30 AM",
    unread: true,
    messages: [
      {
        sender: "other",
        text: "Hello David, I've been thinking about what we discussed in our last session.",
        time: "10:15 AM",
      },
      {
        sender: "me",
        text: "Hi John, I'm glad you're reflecting on our conversation. Any specific insights?",
        time: "10:20 AM",
      },
      {
        sender: "other",
        text: "Yes, I've started implementing the morning routine we talked about, and it's already making a difference.",
        time: "10:25 AM",
      },
      {
        sender: "other",
        text: "Thank you for the advice. I'll try implementing those strategies.",
        time: "10:30 AM",
      },
    ],
  },
  {
    id: "2",
    name: "Michael Brown",
    age: 32,
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I have a question about our upcoming session.",
    lastMessageTime: "Yesterday",
    unread: false,
    messages: [
      {
        sender: "other",
        text: "Hi David, I hope you're doing well.",
        time: "Yesterday, 3:45 PM",
      },
      {
        sender: "me",
        text: "Hello Michael, I'm doing great. How can I help you today?",
        time: "Yesterday, 4:00 PM",
      },
      {
        sender: "other",
        text: "I have a question about our upcoming session.",
        time: "Yesterday, 4:05 PM",
      },
    ],
  },
  {
    id: "3",
    name: "Thomas Clark",
    age: 27,
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "The resources you shared were very helpful. Thank you!",
    lastMessageTime: "Mar 15",
    unread: true,
    messages: [
      {
        sender: "me",
        text: "Thomas, here are the resources we discussed in our session yesterday.",
        time: "Mar 15, 9:00 AM",
      },
      {
        sender: "other",
        text: "Thank you, David! I'll take a look at these.",
        time: "Mar 15, 9:15 AM",
      },
      {
        sender: "other",
        text: "The resources you shared were very helpful. Thank you!",
        time: "Mar 15, 9:20 AM",
      },
    ],
  },
]

