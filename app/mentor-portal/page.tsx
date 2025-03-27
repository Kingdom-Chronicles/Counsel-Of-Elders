"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Check, Clock, Edit, Loader2, MessageSquare, User, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { updateSessionStatus } from "@/app/actions/meetings"

export default function MentorPortalPage() {
  const { toast } = useToast()
  const [availabilityMode, setAvailabilityMode] = useState("view")
  const [isLoading, setIsLoading] = useState(true)
  const [sessions, setSessions] = useState({
    upcoming: [],
    requests: [],
    past: [],
  })
  const [stats, setStats] = useState({
    activeMentees: 0,
    sessionsCompleted: 0,
    hoursOfMentorship: 0,
    averageRating: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch upcoming sessions
        const upcomingResponse = await fetch("/api/sessions?status=CONFIRMED&role=mentor")
        const upcomingSessions = await upcomingResponse.json()

        // Fetch session requests
        const requestsResponse = await fetch("/api/sessions?status=PENDING&role=mentor")
        const requestSessions = await requestsResponse.json()

        // Fetch past sessions
        const pastResponse = await fetch("/api/sessions?status=COMPLETED&role=mentor")
        const pastSessions = await pastResponse.json()

        // Fetch stats
        const statsResponse = await fetch("/api/me/stats")
        const statsData = await statsResponse.json()

        setSessions({
          upcoming: upcomingSessions,
          requests: requestSessions,
          past: pastSessions,
        })

        setStats(statsData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleAcceptSession = async (sessionId) => {
    try {
      const result = await updateSessionStatus(sessionId, "CONFIRMED")

      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setSessions((prev) => ({
        ...prev,
        requests: prev.requests.filter((session) => session.id !== sessionId),
        upcoming: [...prev.upcoming, prev.requests.find((session) => session.id === sessionId)],
      }))

      toast({
        title: "Session confirmed",
        description: "The session has been confirmed and added to your calendar.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm session. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeclineSession = async (sessionId) => {
    try {
      const result = await updateSessionStatus(sessionId, "CANCELLED")

      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setSessions((prev) => ({
        ...prev,
        requests: prev.requests.filter((session) => session.id !== sessionId),
      }))

      toast({
        title: "Session declined",
        description: "The session request has been declined.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to decline session. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
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
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your mentorship sessions and availability</p>
            </div>
          </div>

          <Tabs defaultValue="upcoming" className="mb-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
              <TabsTrigger value="requests">Session Requests</TabsTrigger>
              <TabsTrigger value="past">Past Sessions</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-6">
              {sessions.upcoming.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sessions.upcoming.map((session) => (
                    <SessionCard key={session.id} session={session} type="upcoming" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">You have no upcoming sessions.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="requests" className="mt-6">
              {sessions.requests.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sessions.requests.map((session) => (
                    <RequestCard
                      key={session.id}
                      session={session}
                      onAccept={() => handleAcceptSession(session.id)}
                      onDecline={() => handleDeclineSession(session.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">You have no pending session requests.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="past" className="mt-6">
              {sessions.past.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sessions.past.map((session) => (
                    <SessionCard key={session.id} session={session} type="past" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">You have no past sessions.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Availability</CardTitle>
                  <CardDescription>Manage when you're available for mentorship sessions</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAvailabilityMode(availabilityMode === "view" ? "edit" : "view")}
                >
                  {availabilityMode === "view" ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div key={day} className="text-center font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  {availabilityMode === "view" ? (
                    <div className="grid grid-cols-7 gap-2">
                      <div className="space-y-1">
                        <div className="bg-primary/10 text-primary rounded p-1 text-xs text-center">9:00 AM</div>
                        <div className="bg-primary/10 text-primary rounded p-1 text-xs text-center">10:00 AM</div>
                        <div className="bg-primary/10 text-primary rounded p-1 text-xs text-center">2:00 PM</div>
                      </div>
                      <div className="space-y-1">
                        <div className="bg-primary/10 text-primary rounded p-1 text-xs text-center">1:00 PM</div>
                        <div className="bg-primary/10 text-primary rounded p-1 text-xs text-center">3:00 PM</div>
                      </div>
                      <div className="space-y-1">
                        <div className="bg-primary/10 text-primary rounded p-1 text-xs text-center">9:00 AM</div>
                        <div className="bg-primary/10 text-primary rounded p-1 text-xs text-center">11:00 AM</div>
                      </div>
                      <div className="space-y-1">
                        <div className="bg-primary/10 text-primary rounded p-1 text-xs text-center">2:00 PM</div>
                        <div className="bg-primary/10 text-primary rounded p-1 text-xs text-center">4:00 PM</div>
                      </div>
                      <div className="space-y-1">
                        <div className="bg-primary/10 text-primary rounded p-1 text-xs text-center">10:00 AM</div>
                        <div className="bg-primary/10 text-primary rounded p-1 text-xs text-center">1:00 PM</div>
                      </div>
                      <div className="text-center text-gray-400">Not Available</div>
                      <div className="text-center text-gray-400">Not Available</div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm mb-4">Click on time slots to toggle availability:</p>
                      <div className="grid grid-cols-7 gap-2">
                        <div className="space-y-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            9:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            10:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            11:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            1:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            2:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            3:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            4:00 PM
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            9:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            10:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            11:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            1:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            2:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            3:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            4:00 PM
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            9:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            10:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            11:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            1:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            2:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            3:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            4:00 PM
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            9:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            10:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            11:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            1:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            2:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            3:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            4:00 PM
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            9:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            10:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            11:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            1:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            2:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            3:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            4:00 PM
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            9:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            10:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            11:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            1:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            2:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            3:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            4:00 PM
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            9:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            10:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            11:00 AM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            1:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            2:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            3:00 PM
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            4:00 PM
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mentorship Stats</CardTitle>
                <CardDescription>Your impact as a mentor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.activeMentees}</p>
                      <p className="text-sm text-gray-500">Active Mentees</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.sessionsCompleted}</p>
                      <p className="text-sm text-gray-500">Sessions Completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.hoursOfMentorship}</p>
                      <p className="text-sm text-gray-500">Hours of Mentorship</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.averageRating}/5</p>
                      <p className="text-sm text-gray-500">Average Rating</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

function SessionCard({ session, type }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <CardDescription>
              {session.date} • {session.time}
            </CardDescription>
          </div>
          {type === "upcoming" && (
            <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Confirmed</div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage src={session.mentee.avatar} alt={session.mentee.name} />
            <AvatarFallback>
              {session.mentee.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{session.mentee.name}</p>
            <p className="text-sm text-gray-500">{session.mentee.age} years old</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4" />
          <span>{session.format}</span>
        </div>

        {session.topics && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-1">Discussion Topics:</p>
            <p className="text-sm text-gray-500">{session.topics}</p>
          </div>
        )}

        {session.meetingLink && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <p className="text-sm font-medium mb-1">Google Meet Link:</p>
            <a
              href={session.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {session.meetingLink}
            </a>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {type === "upcoming" && (
          <>
            <Button variant="outline" className="flex-1">
              Reschedule
            </Button>
            <Button className="flex-1" asChild>
              <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                Join Session
              </a>
            </Button>
          </>
        )}
        {type === "past" && (
          <>
            <Button variant="outline" className="flex-1">
              View Notes
            </Button>
            <Button className="flex-1">Schedule Follow-up</Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

function RequestCard({ session, onAccept, onDecline }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    await onAccept()
    setIsLoading(false)
  }

  const handleDecline = async () => {
    setIsLoading(true)
    await onDecline()
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <CardDescription>
              {session.date} • {session.time}
            </CardDescription>
          </div>
          <div className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage src={session.mentee.avatar} alt={session.mentee.name} />
            <AvatarFallback>
              {session.mentee.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{session.mentee.name}</p>
            <p className="text-sm text-gray-500">{session.mentee.age} years old</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4" />
          <span>{session.format}</span>
        </div>

        {session.topics && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-1">Discussion Topics:</p>
            <p className="text-sm text-gray-500">{session.topics}</p>
          </div>
        )}

        {session.message && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-sm font-medium mb-1">Message from {session.mentee.name}:</p>
            <p className="text-sm">{session.message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" size="sm" onClick={handleDecline} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              Decline
            </>
          )}
        </Button>
        <Button className="flex-1" size="sm" onClick={handleAccept} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Accept
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

