import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword, createTokens, setAuthCookies } from '@/lib/auth'
import { withMiddleware, validateRequest } from '@/lib/api-middleware'
import { createConflictError } from '@/lib/api-errors'

// Request validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

async function registerHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequest(registerSchema, body)

    const { email, password, name } = validatedData

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw createConflictError('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    // Create tokens for immediate login after registration
    const { accessToken, refreshToken } = await createTokens(user.id, user.email, false)

    // Set auth cookies
    await setAuthCookies(accessToken, refreshToken, false)

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: false // TODO: Add email verification later
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  return withMiddleware(registerHandler, {
    allowedMethods: ['POST'],
    requireAuth: false,
    skipRateLimit: false
  })(request, {})
} 