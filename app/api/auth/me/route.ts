import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withMiddleware } from '@/lib/api-middleware'
import { createNotFoundError } from '@/lib/api-errors'

async function meHandler(request: NextRequest, context: any) {
  try {
    const userId = context.user?.id

    if (!userId) {
      throw createNotFoundError('User not found')
    }

    // Get user information
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw createNotFoundError('User not found')
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: false, // TODO: Add when email verification is implemented
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

  } catch (error) {
    console.error('Get user profile error:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  return withMiddleware(meHandler, {
    allowedMethods: ['GET'],
    requireAuth: true,
    skipRateLimit: false
  })(request, {})
} 