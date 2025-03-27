"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { updateProfile } from "@/app/actions/profile"

export default function MentorOnboarding() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    title: "",
    bio: "",
    experience: 0,
    coverImage: "",
    expertise: [],
    categories: [],
  })
  const [newExpertise, setNewExpertise] = useState("")
  const [newCategory, setNewCategory] = useState("")

  const handleNext = () => {
    if (step === 1 && !profile.title) {
      toast({
        title: "Missing information",
        description: "Please enter your professional title",
        variant: "destructive",
      })
      return
    }

    if (step === 2 && !profile.bio) {
      toast({
        title: "Missing information",
        description: "Please enter your biography",
        variant: "destructive",
      })
      return
    }

    if (step === 3 && profile.categories.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one category",
        variant: "destructive",
      })
      return
    }

    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
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
        title: "Profile setup complete",
        description: "Your mentor profile has been created successfully",
      })

      // Redirect to mentor portal
      router.push("/mentor-portal")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to set up profile. Please try again.",
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/" className="text-xl font-bold">
          Counsel of Elders
        </Link>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Set Up Your Mentor Profile</CardTitle>
              <CardDescription>Complete your profile to start mentoring others</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-2.5 h-2.5 rounded-full ${
                    s === step ? "bg-primary" : s < step ? "bg-primary/60" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Business Strategist & Faith Leader"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  This will be displayed on your profile and helps mentees understand your expertise at a glance.
                </p>
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
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL (Optional)</Label>
                <Input
                  id="coverImage"
                  placeholder="https://example.com/your-cover-image.jpg"
                  value={profile.coverImage}
                  onChange={(e) => setProfile({ ...profile, coverImage: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  A banner image for your profile. Leave blank to use a default image.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your Biography</h2>
              <div className="space-y-2">
                <Label htmlFor="bio">Tell us about yourself</Label>
                <Textarea
                  id="bio"
                  placeholder="Share your background, experience, and approach to mentorship..."
                  className="min-h-[200px]"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  Your bio helps mentees understand your background and decide if you're the right mentor for them.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Categories & Expertise</h2>
              <div className="space-y-2">
                <Label>Categories</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Select the main categories that describe your mentorship areas.
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.categories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <button
                        type="button"
                        onClick={() => removeCategoryItem(category)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <span className="sr-only">Remove</span>×
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
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Areas of Expertise</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Add specific skills or topics within your categories that you specialize in.
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.expertise.map((item, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {item}
                      <button
                        type="button"
                        onClick={() => removeExpertiseItem(item)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <span className="sr-only">Remove</span>×
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
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Review & Complete</h2>
              <p className="text-sm text-gray-500 mb-4">Review your profile information before completing the setup.</p>

              <div className="space-y-4 border rounded-lg p-4">
                <div>
                  <h3 className="font-medium">Professional Title</h3>
                  <p>{profile.title}</p>
                </div>
                <div>
                  <h3 className="font-medium">Years of Experience</h3>
                  <p>{profile.experience}</p>
                </div>
                <div>
                  <h3 className="font-medium">Biography</h3>
                  <p className="text-sm">{profile.bio}</p>
                </div>
                <div>
                  <h3 className="font-medium">Categories</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.expertise.map((item, index) => (
                      <Badge key={index} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div></div>
          )}
          {step < 4 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

