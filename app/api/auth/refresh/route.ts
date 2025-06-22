import { NextRequest, NextResponse } from 'next/server'
import { refreshAccessToken, getTokensFromCookies, setAuthCookies } from '@/lib/auth'
import { withMiddleware } from '@/lib/api-middleware'
import { createAuthenticationError } from '@/lib/api-errors'

async function refreshHandler(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const { refreshToken } = await getTokensFromCookies()

    if (!refreshToken) {
      throw createAuthenticationError('Refresh token not found')
    }

    // Generate new access token
    const newAccessToken = await refreshAccessToken(refreshToken)

    if (!newAccessToken) {
      throw createAuthenticationError('Invalid or expired refresh token')
    }

    // Update access token cookie (keep existing refresh token)
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60 // 30 minutes
    })

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully'
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  return withMiddleware(refreshHandler, {
    allowedMethods: ['POST'],
    requireAuth: false,
    skipRateLimit: false
  })(request, {})
} 