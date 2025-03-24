"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Filter, Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export default function MentorsPage() {
  const [mentors, setMentors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (activeCategory !== "all") {
          params.append("category", activeCategory)
        }
        if (searchQuery) {
          params.append("search", searchQuery)
        }

        const response = await fetch(`/api/mentors?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch mentors")
        }
        const data = await response.json()
        setMentors(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load mentors. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMentors()
  }, [activeCategory, searchQuery, toast])

  const handleSearch = (e) => {
    e.preventDefault()
    // The search is already triggered by the useEffect
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
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Find a Mentor</h1>
              <p className="text-gray-500 dark:text-gray-400">Browse our community of experienced mentors</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <form onSubmit={handleSearch} className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search mentors..."
                  className="w-full md:w-[250px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <Tabs defaultValue="all" className="mb-6" value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="w-full sm:w-auto flex flex-nowrap overflow-x-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Life">Life</TabsTrigger>
                <TabsTrigger value="Faith">Faith</TabsTrigger>
                <TabsTrigger value="Business">Business</TabsTrigger>
                <TabsTrigger value="Relationships">Relationships</TabsTrigger>
              </TabsList>
              <TabsContent value={activeCategory} className="mt-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <p>Loading mentors...</p>
                  </div>
                ) : mentors.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {mentors.map((mentor) => (
                      <MentorCard key={mentor.id} mentor={mentor} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p>No mentors found. Try adjusting your search criteria.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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

function MentorCard({ mentor }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <img
            alt={`${mentor.name}'s cover photo`}
            className="object-cover w-full h-full"
            height={200}
            src={mentor.coverImage || "/placeholder.svg"}
            width={400}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
            <p className="text-sm text-white/80">{mentor.title}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <Avatar className="h-16 w-16 border-4 border-background -mt-12">
            <AvatarImage src={mentor.avatar} alt={mentor.name} />
            <AvatarFallback>
              {mentor.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap gap-1 mt-2">
            {mentor.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{mentor.bio}</p>
        <div className="text-sm">
          <p className="font-medium">Experience: {mentor.experience} years</p>
          <p className="text-gray-500 dark:text-gray-400">Sessions: {mentor.sessions} completed</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row justify-between gap-2">
        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
          <Link href={`/mentors/${mentor.id}`}>View Profile</Link>
        </Button>
        <Button size="sm" asChild className="w-full sm:w-auto">
          <Link href={`/mentors/${mentor.id}/schedule`}>Schedule</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

