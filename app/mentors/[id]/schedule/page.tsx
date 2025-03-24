"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Clock } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function SchedulePage({ params }) {
  // In a real app, you would fetch the mentor data based on the ID
  const mentor = mentors.find((m) => m.id === params.id) || mentors[0]

  const [date, setDate] = useState(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)

  // Generate time slots for the selected date
  // In a real app, these would come from the mentor's availability
  const timeSlots = [
    { time: "9:00 AM", available: true },
    { time: "10:00 AM", available: true },
    { time: "11:00 AM", available: false },
    { time: "1:00 PM", available: true },
    { time: "2:00 PM", available: true },
    { time: "3:00 PM", available: false },
    { time: "4:00 PM", available: true },
  ]

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
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-6">
            <Link
              href={`/mentors/${mentor.id}`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to {mentor.name}'s Profile
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-6">Schedule a Session</h1>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>Choose when you'd like to meet with {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Date</h3>
                      <div className="border rounded-md p-2">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="mx-auto"
                          disabled={(date) => {
                            // Disable weekends and past dates
                            return (
                              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                              date.getDay() === 0 ||
                              date.getDay() === 6
                            )
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Available Time Slots</h3>
                      {date ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {timeSlots.map((slot, index) => (
                            <Button
                              key={index}
                              variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                              className={cn("justify-start", !slot.available && "opacity-50 cursor-not-allowed")}
                              disabled={!slot.available}
                              onClick={() => setSelectedTimeSlot(slot.time)}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Please select a date first</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Session Details</h3>
                    <Textarea
                      placeholder="What would you like to discuss in this session? Any specific topics or questions?"
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button disabled={!selectedTimeSlot}>Request Session</Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Session Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={mentor.avatar} alt={mentor.name} />
                      <AvatarFallback>
                        {mentor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{mentor.name}</p>
                      <p className="text-sm text-gray-500">{mentor.title}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className="text-sm text-gray-500">
                      {date
                        ? date.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Select a date"}
                      {selectedTimeSlot ? ` at ${selectedTimeSlot}` : ""}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium">Session Type</p>
                    <p className="text-sm text-gray-500">60-minute video call</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium">What to Expect</p>
                    <p className="text-sm text-gray-500">
                      After requesting this session, {mentor.name} will review and confirm. Once confirmed, you'll
                      receive a calendar invite with connection details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 px-4 md:px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 Counsel of Elders. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="/terms">
              Terms of Service
            </Link>
            <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

// Sample data
const mentors = [
  {
    id: "1",
    name: "David Wilson",
    title: "Business Strategist & Faith Leader",
    bio: "With 30 years of experience in business leadership and ministry, I help young men navigate career decisions while maintaining spiritual balance.",
    avatar: "/placeholder.svg?height=64&width=64",
    coverImage: "/placeholder.svg?height=200&width=400",
    categories: ["Business", "Faith"],
    experience: 30,
    sessions: 124,
  },
]

