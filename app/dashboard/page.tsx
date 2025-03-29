"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, MessageSquare, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [recommendedMentors, setRecommendedMentors] = useState([])

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch("/api/mentors?limit=3")
        if (!response.ok) {
          throw new Error("Failed to fetch mentors")
        }

        const mentorsFromDb = await response.json()

        // Combine database mentors with sample mentors
        const combinedMentors = [
          ...mentorsFromDb,
          // Add sample mentors only if we need to fill up to 3 mentors
          ...(mentorsFromDb.length < 3 ? sampleRecommendedMentors.slice(0, 3 - mentorsFromDb.length) : []),
        ]

        setRecommendedMentors(combinedMentors)
      } catch (error) {
        console.error("Error fetching mentors:", error)
        // Fallback to sample data if fetch fails
        setRecommendedMentors(sampleRecommendedMentors)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMentors()
  }, [])

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
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your mentorship journey</p>
            </div>
            <Button asChild>
              <Link href="/mentors">Find a Mentor</Link>
            </Button>
          </div>

          <Tabs defaultValue="upcoming" className="mb-6">
            <TabsList className="w-full sm:w-auto flex flex-nowrap overflow-x-auto">
              <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
              <TabsTrigger value="past">Past Sessions</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingSessions.map((session) => (
                  <SessionCard key={session.id} session={session} type="upcoming" />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="past" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastSessions.map((session) => (
                  <SessionCard key={session.id} session={session} type="past" />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="requests" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pendingRequests.map((session) => (
                  <SessionCard key={session.id} session={session} type="pending" />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Your Mentorship Journey</CardTitle>
                <CardDescription>Track your progress and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{upcomingSessions.length + pastSessions.length}</p>
                      <p className="text-sm text-gray-500">Total Sessions</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-gray-500">Hours of Mentorship</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-sm text-gray-500">Active Mentors</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Growth Areas</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Business Leadership</span>
                        <span>75%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Faith Development</span>
                        <span>60%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Relationship Skills</span>
                        <span>40%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "40%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Mentors</CardTitle>
                <CardDescription>Based on your interests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendedMentors.map((mentor) => (
                      <div key={mentor.id} className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={mentor.avatar} alt={mentor.name} />
                          <AvatarFallback>
                            {mentor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{mentor.name}</p>
                          <p className="text-sm text-gray-500 truncate">{mentor.title}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/mentors/${mentor.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/mentors">View All Mentors</Link>
                </Button>
              </CardFooter>
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

// Update the SessionCard component in the dashboard page
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
            <div
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                session.status === "CONFIRMED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {session.status === "CONFIRMED" ? "Confirmed" : "Pending"}
            </div>
          )}
          {type === "pending" && (
            <div className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage src={session.mentor.avatar} alt={session.mentor.name} />
            <AvatarFallback>
              {session.mentor.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{session.mentor.name}</p>
            <p className="text-sm text-gray-500">{session.mentor.title}</p>
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

        {session.meetingLink && session.status === "CONFIRMED" && (
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
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        {type === "upcoming" && (
          <>
            <Button variant="outline" className="w-full sm:w-auto">
              Reschedule
            </Button>
            {session.status === "CONFIRMED" && session.meetingLink ? (
              <Button className="w-full sm:w-auto" asChild>
                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                  Join Session
                </a>
              </Button>
            ) : (
              <Button className="w-full sm:w-auto" disabled>
                Awaiting Confirmation
              </Button>
            )}
          </>
        )}
        {type === "past" && (
          <>
            <Button variant="outline" className="w-full sm:w-auto">
              View Notes
            </Button>
            <Button className="w-full sm:w-auto">Book Again</Button>
          </>
        )}
        {type === "pending" && (
          <>
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" disabled>
              Awaiting Response
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

// Sample data
const upcomingSessions = [
  {
    id: "1",
    title: "Career Strategy Session",
    date: "March 25, 2025",
    time: "10:00 AM",
    format: "Video Call (Google Meet)",
    mentor: {
      name: "David Wilson",
      title: "Business Strategist & Faith Leader",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    topics: "Career transition, leadership development, finding purpose in work",
    status: "CONFIRMED",
    meetingLink: "https://meet.google.com/xyz-abc-def",
  },
  {
    id: "2",
    title: "Faith & Life Balance",
    date: "April 2, 2025",
    time: "2:00 PM",
    format: "In-person (Coffee Shop)",
    mentor: {
      name: "James Thompson",
      title: "Faith Leader & Community Builder",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    topics: "Integrating faith into daily life, community involvement, spiritual disciplines",
    status: "PENDING",
  },
]

const pastSessions = [
  {
    id: "3",
    title: "Relationship Foundations",
    date: "March 10, 2025",
    time: "3:00 PM",
    format: "Video Call (Google Meet)",
    mentor: {
      name: "Michael Johnson",
      title: "Relationship Coach & Family Counselor",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    topics: "Building healthy relationships, communication skills, preparing for marriage",
  },
]

const pendingRequests = [
  {
    id: "4",
    title: "Entrepreneurship Guidance",
    date: "April 10, 2025",
    time: "1:00 PM",
    format: "Video Call (Google Meet)",
    mentor: {
      name: "Robert Chen",
      title: "Entrepreneur & Life Coach",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    topics: "Business idea validation, startup funding, work-life balance as an entrepreneur",
  },
]

// Sample data for fallback
const sampleRecommendedMentors = [
  {
    id: "5",
    name: "William Parker",
    title: "Life Balance & Wellness Guide",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "6",
    name: "Samuel Rodriguez",
    title: "Career Mentor & Leadership Coach",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "7",
    name: "Thomas Wright",
    title: "Financial Advisor & Stewardship Coach",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

