"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getServerSession } from "next-auth/next"

import { db } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Replace the existing profileSchema with role-specific schemas
const mentorProfileSchema = z.object({
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(1, "Bio is required"),
  experience: z.coerce.number().optional(),
  coverImage: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
})

const menteeProfileSchema = z.object({
  bio: z.string().min(1, "Bio is required"),
  goals: z.string().optional(),
  expertise: z.array(z.string()).optional(), // Used for interests in mentee profiles
})

// Update the updateProfile function to use different schemas based on role
export async function updateProfile(formData: FormData) {
  // Use getServerSession with authOptions
  const session = await getServerSession(authOptions)

  console.log("session in updateProfile", session)

  if (!session || !session.user) {
    return {
      error: "Not authenticated",
    }
  }

  const isMentor = session.user.role === "MENTOR"

  // Use different validation schemas based on user role
  let validatedFields
  if (isMentor) {
    validatedFields = mentorProfileSchema.safeParse({
      title: formData.get("title"),
      bio: formData.get("bio"),
      experience: formData.get("experience"),
      coverImage: formData.get("coverImage"),
      expertise: formData.getAll("expertise"),
      categories: formData.getAll("categories"),
    })
  } else {
    validatedFields = menteeProfileSchema.safeParse({
      bio: formData.get("bio"),
      goals: formData.get("goals"),
      expertise: formData.getAll("expertise"), // Interests for mentees
    })
  }

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    // Get user profile
    const profile = await db.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!profile) {
      return {
        error: "Profile not found",
      }
    }

    // Extract validated data
    const data = validatedFields.data

    // Update profile with role-specific fields
    if (isMentor) {
      await db.profile.update({
        where: {
          id: profile.id,
        },
        data: {
          title: data.title,
          bio: data.bio,
          experience: data.experience,
          coverImage: data.coverImage,
          expertise: data.expertise,
        },
      })

      // Update categories if provided (mentor only)
      if (data.categories && data.categories.length > 0) {
        // First, remove all existing categories
        await db.profile.update({
          where: {
            id: profile.id,
          },
          data: {
            categories: {
              set: [],
            },
          },
        })

        // Then, add new categories
        for (const categoryName of data.categories) {
          // Find or create category
          let category = await db.category.findUnique({
            where: {
              name: categoryName,
            },
          })

          if (!category) {
            category = await db.category.create({
              data: {
                name: categoryName,
              },
            })
          }

          // Connect category to profile
          await db.profile.update({
            where: {
              id: profile.id,
            },
            data: {
              categories: {
                connect: {
                  id: category.id,
                },
              },
            },
          })
        }
      }
    } else {
      // Update mentee profile
      await db.profile.update({
        where: {
          id: profile.id,
        },
        data: {
          bio: data.bio,
          expertise: data.expertise, // Store interests in expertise field
          // Store goals in a field that makes sense for your schema
          // You might need to add a 'goals' field to your Profile model
        },
      })
    }

    revalidatePath("/profile")
    revalidatePath("/mentor-portal/profile")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      error: "Failed to update profile. Please try again.",
    }
  }
}

export async function addExperience(formData: FormData) {
  // Use getServerSession with authOptions
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return {
      error: "Not authenticated",
    }
  }

  const role = formData.get("role") as string
  const company = formData.get("company") as string
  const period = formData.get("period") as string
  const description = formData.get("description") as string

  if (!role || !company || !period) {
    return {
      error: "Missing required fields",
    }
  }

  // Get user profile
  const profile = await db.profile.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  if (!profile) {
    return {
      error: "Profile not found",
    }
  }

  // Add experience
  await db.experience.create({
    data: {
      profileId: profile.id,
      role,
      company,
      period,
      description,
    },
  })

  revalidatePath("/profile")
  revalidatePath("/mentor-portal/profile")
  return { success: true }
}

// Add this function to handle updating availability
export async function updateAvailability(availabilityData: any[]) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return {
      error: "Not authenticated",
    }
  }

  // Check if user is a mentor
  if (session.user.role !== "MENTOR") {
    return {
      error: "Only mentors can update availability",
    }
  }

  try {
    // Get user profile
    const profile = await db.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!profile) {
      return {
        error: "Profile not found",
      }
    }

    // First, remove all existing availability
    await db.availability.deleteMany({
      where: {
        profileId: profile.id,
      },
    })

    // Then, add new availability
    for (const item of availabilityData) {
      await db.availability.create({
        data: {
          profileId: profile.id,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
        },
      })
    }

    revalidatePath("/mentor-portal")
    return { success: true }
  } catch (error) {
    console.error("Error updating availability:", error)
    return {
      error: "Failed to update availability. Please try again.",
    }
  }
}

