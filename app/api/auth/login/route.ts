import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { 
  verifyPassword, 
  createTokens, 
  setAuthCookies
} from '@/lib/auth'
import { withMiddleware, validateRequest } from '@/lib/api-middleware'
import { createAuthenticationError } from '@/lib/api-errors'

// Request validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
})

async function loginHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequest(loginSchema, body)

    const { email, password, rememberMe } = validatedData

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true
      }
    })

    if (!user) {
      // Prevent user enumeration - same error for invalid email or password
      throw createAuthenticationError('Invalid email or password')
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      throw createAuthenticationError('Invalid email or password')
    }

    // Create tokens
    const { accessToken, refreshToken } = await createTokens(user.id, user.email, rememberMe)

    // Set auth cookies
    await setAuthCookies(accessToken, refreshToken, rememberMe)

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: false // TODO: Add this field once database is updated
      },
      rememberMe
    })

  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  return withMiddleware(loginHandler, {
    allowedMethods: ['POST'],
    requireAuth: false,
    skipRateLimit: false
  })(request, {})
} 