"use server"

import { hash } from "bcrypt"
import { z } from "zod"

import { db } from "@/lib/db"
import { signIn } from "next-auth/react"

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["MENTEE", "MENTOR"]),
})

export async function registerUser(formData: FormData) {
  const validatedFields = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("userType")?.toString().toUpperCase() || "MENTEE",
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password, role } = validatedFields.data

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    return {
      error: "User already exists",
    }
  }

  // Hash password
  const hashedPassword = await hash(password, 10)

  // Create user
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  })

  // Create empty profile
  await db.profile.create({
    data: {
      userId: user.id,
    },
  })

  // Return success response
  return { success: true, user }
}

