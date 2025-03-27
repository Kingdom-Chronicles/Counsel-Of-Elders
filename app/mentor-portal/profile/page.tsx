"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Camera, Loader2, Plus, Save, Trash } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { updateProfile, addExperience } from "@/app/actions/profile"

export default function MentorProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: "",
    title: "",
    bio: "",
    experience: 0,
    coverImage: "",
    expertise: [],
    categories: [],
    experiences: [],
  })
  const [newExpertise, setNewExpertise] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newExperience, setNewExperience] = useState({
    role: "",
    company: "",
    period: "",
    description: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/me/profile")
        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append("title", profile.title)
      formData.append("bio", profile.bio)
      formData.append("experience", profile.experience.toString())
      formData.append("coverImage", profile.coverImage)

      profile.expertise.forEach((item) => {
        formData.append("expertise", item)
      })

      profile.categories.forEach((category) => {
        formData.append("categories", category)
      })

      const result = await updateProfile(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddExperience = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append("role", newExperience.role)
      formData.append("company", newExperience.company)
      formData.append("period", newExperience.period)
      formData.append("description", newExperience.description)

      const result = await addExperience(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setProfile({
        ...profile,
        experiences: [...profile.experiences, newExperience],
      })

      // Reset form
      setNewExperience({
        role: "",
        company: "",
        period: "",
        description: "",
      })

      toast({
        title: "Success",
        description: "Experience added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add experience. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addExpertiseItem = () => {
    if (newExpertise.trim() && !profile.expertise.includes(newExpertise.trim())) {
      setProfile({
        ...profile,
        expertise: [...profile.expertise, newExpertise.trim()],
      })
      setNewExpertise("")
    }
  }

  const removeExpertiseItem = (item) => {
    setProfile({
      ...profile,
      expertise: profile.expertise.filter((i) => i !== item),
    })
  }

  const addCategoryItem = () => {
    if (newCategory.trim() && !profile.categories.includes(newCategory.trim())) {
      setProfile({
        ...profile,
        categories: [...profile.categories, newCategory.trim()],
      })
      setNewCategory("")
    }
  }

  const removeCategoryItem = (item) => {
    setProfile({
      ...profile,
      categories: profile.categories.filter((i) => i !== item),
    })
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
              <AvatarImage src={profile.image || "/placeholder.svg?height=32&width=32"} alt="Profile" />
              <AvatarFallback>
                {profile.name
                  ? profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "ME"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-gray-500">Manage your mentor profile information</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your basic profile information</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-shrink-0">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.image || "/placeholder.svg?height=96&width=96"} alt="Profile" />
                        <AvatarFallback className="text-2xl">
                          {profile.name
                            ? profile.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "ME"}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        <Camera className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" value={profile.name} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={profile.email} disabled />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Professional Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g. Business Strategist & Faith Leader"
                          value={profile.title}
                          onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          type="number"
                          min="0"
                          value={profile.experience}
                          onChange={(e) => setProfile({ ...profile, experience: Number.parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell mentees about yourself, your background, and your approach to mentorship..."
                      className="min-h-[150px]"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Cover Image URL</Label>
                    <Input
                      id="coverImage"
                      placeholder="https://example.com/your-cover-image.jpg"
                      value={profile.coverImage}
                      onChange={(e) => setProfile({ ...profile, coverImage: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.categories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {category}
                          <button
                            type="button"
                            onClick={() => removeCategoryItem(category)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Trash className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a category (e.g. Business, Faith, Life)"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addCategoryItem()
                          }
                        }}
                      />
                      <Button type="button" onClick={addCategoryItem} size="sm">
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Areas of Expertise</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.expertise.map((item, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeExpertiseItem(item)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Trash className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an expertise (e.g. Leadership Development)"
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addExpertiseItem()
                          }
                        }}
                      />
                      <Button type="button" onClick={addExpertiseItem} size="sm">
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
                <CardDescription>Add your professional experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {profile.experiences.map((exp, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <h3 className="font-semibold">{exp.role}</h3>
                      <p className="text-sm text-gray-500">
                        {exp.company} • {exp.period}
                      </p>
                      <p className="mt-2 text-sm">{exp.description}</p>
                    </div>
                  ))}

                  <form onSubmit={handleAddExperience} className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Add New Experience</h3>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Input
                            id="role"
                            placeholder="e.g. CEO"
                            value={newExperience.role}
                            onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            placeholder="e.g. Acme Inc."
                            value={newExperience.company}
                            onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="period">Period</Label>
                        <Input
                          id="period"
                          placeholder="e.g. 2015-Present"
                          value={newExperience.period}
                          onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your responsibilities and achievements..."
                          value={newExperience.description}
                          onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                        />
                      </div>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Experience
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
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

