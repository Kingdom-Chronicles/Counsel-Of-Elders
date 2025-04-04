"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Clock, Loader2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { createMeetingWithGoogleMeet } from "@/app/actions/meetings"

export default function SchedulePage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mentor, setMentor] = useState(null)
  const [date, setDate] = useState(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [topics, setTopics] = useState("")
  const [timeSlots, setTimeSlots] = useState([])
  const [availableDays, setAvailableDays] = useState([])

  // Fetch mentor data and availability
  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/mentors/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch mentor")
        }
        const data = await response.json()
        setMentor(data)

        // Extract available days from mentor's availability
        const availableDaysSet = new Set(data.availability?.map((slot) => slot.dayOfWeek) || [])
        setAvailableDays(Array.from(availableDaysSet))

        // Update time slots when date changes
        updateTimeSlotsForDate(date, data.availability || [])
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load mentor information. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMentor()
  }, [params.id, toast])

  // Update time slots when date changes
  useEffect(() => {
    if (mentor?.availability) {
      updateTimeSlotsForDate(date, mentor.availability)
    }
  }, [date, mentor])

  const updateTimeSlotsForDate = (selectedDate, availability) => {
    if (!selectedDate) return

    const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const availableSlots = availability.filter((slot) => slot.dayOfWeek === dayOfWeek)

    if (availableSlots.length === 0) {
      setTimeSlots([])
      setSelectedTimeSlot(null)
      return
    }

    const slots = []
    availableSlots.forEach((slot) => {
      const [startHour, startMinute] = slot.startTime.split(":").map(Number)
      const [endHour, endMinute] = slot.endTime.split(":").map(Number)

      // Generate slots in 1-hour increments
      let currentHour = startHour
      const currentMinute = startMinute

      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`
        slots.push({
          time: formatTime(timeString),
          available: true,
        })

        // Increment by 1 hour
        currentHour += 1
      }
    })

    setTimeSlots(slots)
    setSelectedTimeSlot(null) // Reset selected time slot when date changes
  }

  // Helper function to format time (24h to 12h)
  const formatTime = (time24h) => {
    const [hour, minute] = time24h.split(":").map(Number)
    const period = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!date || !selectedTimeSlot) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your session",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("title", `Session with ${mentor.name}`)
      formData.append("mentorId", params.id)
      formData.append("date", date.toISOString().split("T")[0])
      formData.append("time", selectedTimeSlot)
      formData.append("duration", "60")
      formData.append("topics", topics)

      const result = await createMeetingWithGoogleMeet(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Session requested",
        description: "Your session has been requested. You'll be notified when the mentor confirms.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !mentor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
                <form onSubmit={handleSubmit}>
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
                              // Disable past dates and days when mentor is not available
                              const dayOfWeek = date.getDay()
                              return (
                                date < new Date(new Date().setHours(0, 0, 0, 0)) || !availableDays.includes(dayOfWeek)
                              )
                            }}
                          />
                        </div>
                        {availableDays.length === 0 && (
                          <p className="text-sm text-amber-600 mt-2">
                            This mentor hasn't set their availability yet. Please check back later or message them.
                          </p>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Available Time Slots</h3>
                        {date ? (
                          timeSlots.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {timeSlots.map((slot, index) => (
                                <Button
                                  key={index}
                                  variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                                  className={cn("justify-start", !slot.available && "opacity-50 cursor-not-allowed")}
                                  disabled={!slot.available}
                                  onClick={() => setSelectedTimeSlot(slot.time)}
                                  type="button"
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  {slot.time}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No available time slots for this date.</p>
                          )
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
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button disabled={!selectedTimeSlot || isSubmitting} type="submit">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        "Request Session"
                      )}
                    </Button>
                  </CardFooter>
                </form>
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
                    <p className="text-sm text-gray-500">60-minute video call via Google Meet</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium">What to Expect</p>
                    <p className="text-sm text-gray-500">
                      After requesting this session, {mentor.name} will review and confirm. Once confirmed, you'll
                      receive a Google Meet link for your session.
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

