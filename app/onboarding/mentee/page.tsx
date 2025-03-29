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

export default function MenteeOnboarding() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  // Update the profile state to include title and coverImage
  const [profile, setProfile] = useState({
    title: "",
    bio: "",
    interests: [],
    goals: "",
    coverImage: "",
  })
  const [newInterest, setNewInterest] = useState("")

  // Update validation in handleNext to require title
  const handleNext = () => {
    if (step === 1) {
      if (!profile.title) {
        toast({
          title: "Missing information",
          description: "Please enter a profile title",
          variant: "destructive",
        })
        return
      }
      if (!profile.bio) {
        toast({
          title: "Missing information",
          description: "Please tell us a bit about yourself",
          variant: "destructive",
        })
        return
      }
    }

    if (step === 2 && profile.interests.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one interest area",
        variant: "destructive",
      })
      return
    }

    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Update the handleComplete function to include title and coverImage in the form data
  const handleComplete = async () => {
    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append("title", profile.title)
      formData.append("bio", profile.bio)
      formData.append("goals", profile.goals)
      formData.append("coverImage", profile.coverImage)

      profile.interests.forEach((item) => {
        formData.append("expertise", item) // Using expertise field for interests
      })

      console.log("Submitting mentee profile data...")
      const response = await updateProfile(formData)
      console.log("Profile update result:", response)

      if (response.success) {
        toast({
          title: "Profile setup complete",
          description: "Your mentee profile has been created successfully",
        })

        // Redirect to the dashboard
        window.location.href = "/dashboard"
      } else {
        console.error(response.error)
        toast({
          title: "Error",
          description: response.error || "Failed to set up profile. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in handleComplete:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to set up profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addInterestItem = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, newInterest.trim()],
      })
      setNewInterest("")
    }
  }

  const removeInterestItem = (item) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter((i) => i !== item),
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
              <CardTitle className="text-2xl">Set Up Your Mentee Profile</CardTitle>
              <CardDescription>Complete your profile to find the right mentor</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
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
          {/* Add UI for title and coverImage fields in step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">About You</h2>
              <div className="space-y-2">
                <Label htmlFor="title">Profile Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Software Developer seeking career guidance"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  A brief title that describes what you're looking for in mentorship.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Tell us about yourself</Label>
                <Textarea
                  id="bio"
                  placeholder="Share a bit about your background, current situation, and what brings you to seek mentorship..."
                  className="min-h-[200px]"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  This helps mentors understand your background and how they can best support you.
                </p>
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
              <h2 className="text-lg font-semibold">Areas of Interest</h2>
              <div className="space-y-2">
                <Label>What areas are you seeking guidance in?</Label>
                <p className="text-sm text-gray-500 mb-2">Select the main areas where you'd like mentorship.</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterestItem(interest)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <span className="sr-only">Remove</span>×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an interest (e.g. Career Growth, Faith, Relationships)"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addInterestItem()
                      }
                    }}
                  />
                  <Button type="button" onClick={addInterestItem} size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your Goals</h2>
              <div className="space-y-2">
                <Label htmlFor="goals">What do you hope to achieve through mentorship?</Label>
                <Textarea
                  id="goals"
                  placeholder="Describe your short and long-term goals, and what specific guidance you're seeking..."
                  className="min-h-[200px]"
                  value={profile.goals}
                  onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  Being clear about your goals will help mentors provide more targeted guidance.
                </p>
              </div>

              {/* Update the review section in step 3 to include title */}
              <div className="space-y-4 border rounded-lg p-4 mt-6">
                <h3 className="font-medium">Review Your Profile</h3>
                <div>
                  <h4 className="text-sm font-medium">Profile Title</h4>
                  <p className="text-sm text-gray-600 mt-1">{profile.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">About You</h4>
                  <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Areas of Interest</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Your Goals</h4>
                  <p className="text-sm text-gray-600 mt-1">{profile.goals}</p>
                </div>
                {profile.coverImage && (
                  <div>
                    <h4 className="text-sm font-medium">Cover Image</h4>
                    <p className="text-sm text-gray-600 mt-1 truncate">{profile.coverImage}</p>
                  </div>
                )}
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
          {step < 3 ? (
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

