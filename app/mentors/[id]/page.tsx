import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, Clock, MapPin, MessageSquare, Star, User } from "lucide-react"

import { db } from "@/lib/db"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Fetch mentor data from the database
async function getMentor(id) {
  try {
    const user = await db.user.findUnique({
      where: {
        id: id,
        role: "MENTOR",
      },
      include: {
        profile: {
          include: {
            categories: true,
            experiences: true,
            reviews: true,
            availability: true,
          },
        },
      },
    })

    if (!user || !user.profile) {
      return null
    }

    // Transform data for the frontend
    return {
      id: user.id,
      name: user.name,
      title: user.profile.title,
      bio: user.profile.bio,
      avatar: user.image || "/placeholder.svg?height=64&width=64",
      coverImage: user.profile.coverImage || "/placeholder.svg?height=200&width=400",
      categories: user.profile.categories.map((c) => c.name),
      expertise: user.profile.expertise || [],
      experience: user.profile.experience || 0,
      sessions: user.profile.reviews.length,
      experiences: user.profile.experiences.map((exp) => ({
        role: exp.role,
        company: exp.company,
        period: exp.period,
        description: exp.description,
      })),
      reviews: user.profile.reviews.map((review) => ({
        name: review.authorName,
        rating: review.rating,
        date: review.date.toLocaleDateString(),
        comment: review.comment,
      })),
      availability: user.profile.availability.map((avail) => ({
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
      })),
    }
  } catch (error) {
    console.error("Error fetching mentor:", error)
    return null
  }
}

export default async function MentorProfilePage({ params }) {
  // Fetch mentor data from the database
  const mentorFromDb = await getMentor(params.id)

  // If mentor not found in database, try to find in sample data
  if (!mentorFromDb) {
    const mentorFromSample = sampleMentors.find((m) => m.id === params.id)

    // If not found in sample data either, return 404
    if (!mentorFromSample) {
      notFound()
    }

    // Use sample data
    return <MentorProfile mentor={mentorFromSample} />
  }

  // Use database data
  return <MentorProfile mentor={mentorFromDb} />
}

// Separate component for the mentor profile UI
function MentorProfile({ mentor }) {
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
            <Link href="/mentors" className="text-sm text-primary hover:underline flex items-center gap-1">
              ← Back to Mentors
            </Link>
          </div>

          <div className="relative mb-8">
            <div className="h-48 md:h-64 w-full rounded-lg overflow-hidden">
              <img
                alt={`${mentor.name}'s cover photo`}
                className="object-cover w-full h-full"
                src={mentor.coverImage || "/placeholder.svg?height=200&width=400"}
              />
            </div>
            <div className="absolute -bottom-16 left-4 md:left-8">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
                <AvatarImage src={mentor.avatar} alt={mentor.name} />
                <AvatarFallback>
                  {mentor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="mt-20 md:mt-16 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold">{mentor.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400">{mentor.title}</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <Link href={`/messages?mentor=${mentor.id}`}>
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Link>
                  </Button>
                  <Button size="sm" className="gap-1" asChild>
                    <Link href={`/mentors/${mentor.id}/schedule`}>
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </Link>
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="about" className="mb-6">
                <TabsList>
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="mt-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Biography</h2>
                    <p>{mentor.bio}</p>
                    {!mentor.bio?.includes("holistic approach") && (
                      <p>
                        I believe in a holistic approach to mentorship, addressing not just the immediate challenges but
                        also the underlying principles that lead to long-term success and fulfillment. My goal is to
                        help you develop both practical skills and wisdom that will serve you throughout your life
                        journey.
                      </p>
                    )}

                    <h2 className="text-xl font-semibold pt-4">Areas of Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                      {mentor.categories?.map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                      {mentor.expertise?.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="experience" className="mt-6">
                  <div className="space-y-6">
                    {mentor.experiences && mentor.experiences.length > 0 ? (
                      mentor.experiences.map((exp, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                          <h3 className="font-semibold">{exp.role}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {exp.company} • {exp.period}
                          </p>
                          <p className="mt-2">{exp.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No experience information available.</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="mt-6">
                  <div className="space-y-6">
                    {mentor.reviews && mentor.reviews.length > 0 ? (
                      mentor.reviews.map((review, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {review.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.name}</p>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-2">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No reviews available yet.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Mentorship Details</CardTitle>
                  <CardDescription>Information about sessions and availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Experience: {mentor.experience} years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Sessions: {mentor.sessions} completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Session Length: 60 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>Format: Virtual or In-person</span>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Availability</h3>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      {mentor.availability && mentor.availability.length > 0 ? (
                        <>
                          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                            const isAvailable = mentor.availability.some((a) => a.dayOfWeek === day)
                            return (
                              <div
                                key={day}
                                className={`border rounded-md py-1 ${
                                  isAvailable ? "bg-gray-50 dark:bg-gray-800" : "text-gray-400"
                                }`}
                              >
                                {dayNames[day]}
                              </div>
                            )
                          })}
                        </>
                      ) : (
                        <>
                          <div className="border rounded-md py-1 bg-gray-50 dark:bg-gray-800">Mon</div>
                          <div className="border rounded-md py-1">Tue</div>
                          <div className="border rounded-md py-1 bg-gray-50 dark:bg-gray-800">Wed</div>
                          <div className="border rounded-md py-1">Thu</div>
                          <div className="border rounded-md py-1 bg-gray-50 dark:bg-gray-800">Fri</div>
                          <div className="border rounded-md py-1 text-gray-400">Sat</div>
                        </>
                      )}
                    </div>
                  </div>

                  <Button className="w-full mt-4" asChild>
                    <Link href={`/mentors/${mentor.id}/schedule`}>Schedule a Session</Link>
                  </Button>
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

// Sample data for fallback
const sampleMentors = [
  {
    id: "1",
    name: "David Wilson",
    title: "Business Strategist & Faith Leader",
    bio: "With 30 years of experience in business leadership and ministry, I help young men navigate career decisions while maintaining spiritual balance.",
    avatar: "/placeholder.svg?height=64&width=64",
    coverImage: "/placeholder.svg?height=200&width=400",
    categories: ["Business", "Faith"],
    expertise: ["Leadership Development", "Career Planning", "Spiritual Growth", "Work-Life Balance"],
    experience: 30,
    sessions: 124,
    experiences: [
      {
        role: "CEO",
        company: "Wilson Consulting Group",
        period: "2005-Present",
        description:
          "Founded and lead a business consulting firm specializing in helping small to medium businesses align their operations with their core values.",
      },
      {
        role: "Senior Pastor",
        company: "Grace Community Church",
        period: "1995-2005",
        description:
          "Led a congregation of 500+ members, focusing on community outreach and youth mentorship programs.",
      },
      {
        role: "Business Development Director",
        company: "Tech Innovations Inc.",
        period: "1990-1995",
        description: "Managed strategic partnerships and growth initiatives for an emerging technology company.",
      },
    ],
    reviews: [
      {
        name: "Michael Brown",
        rating: 5,
        date: "March 15, 2025",
        comment:
          "David's guidance helped me navigate a difficult career transition while keeping my faith at the center. His wisdom and practical advice were exactly what I needed.",
      },
      {
        name: "Thomas Clark",
        rating: 5,
        date: "February 2, 2025",
        comment:
          "I've had several sessions with David, and each one has been transformative. He asks the right questions and provides insights that have changed my perspective on leadership.",
      },
      {
        name: "Ryan Johnson",
        rating: 4,
        date: "January 10, 2025",
        comment:
          "David brings a unique combination of business acumen and spiritual wisdom. His mentorship has been invaluable in helping me make important life decisions.",
      },
    ],
  },
]

