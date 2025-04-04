"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
// import { getSession } from "next-auth/react"
import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/auth"

const profileSchema = z.object({
  title: z.string().optional(),
  bio: z.string().optional(),
  experience: z.coerce.number().optional(),
  coverImage: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
})

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions)


  if (!session || !session.user) {
    return {
      error: "Not authenticated",
    }
  }

  const validatedFields = profileSchema.safeParse({
    title: formData.get("title"),
    bio: formData.get("bio"),
    experience: formData.get("experience"),
    coverImage: formData.get("coverImage"),
    expertise: formData.getAll("expertise"),
    categories: formData.getAll("categories"),
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, bio, experience, coverImage, expertise, categories } = validatedFields.data

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


    // Update profile
    await db.profile.update({
      where: {
        id: profile.id,
      },
      data: {
        title,
        bio,
        experience,
        coverImage,
        expertise,
      },
    })

    // Update categories if provided
    if (categories && categories.length > 0) {
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
      for (const categoryName of categories) {
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

    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      error: "Failed to update profile. Please try again.",
    }
  }
}

export async function addExperience(formData: FormData) {
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

export async function updateAvailability(availabilityData: any) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return {
      error: "Not authenticated",
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
}

