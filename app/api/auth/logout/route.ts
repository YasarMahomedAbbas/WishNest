import { NextRequest, NextResponse } from 'next/server'
import { revokeRefreshToken, clearAuthCookies, getTokensFromCookies } from '@/lib/auth'
import { withMiddleware } from '@/lib/api-middleware'

async function logoutHandler(request: NextRequest) {
  try {
    // Get tokens from cookies
    const { refreshToken } = await getTokensFromCookies()

    // Revoke refresh token if it exists
    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }

    // Clear auth cookies
    await clearAuthCookies()

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Logout error:', error)
    
    // Even if there's an error, clear cookies and return success
    // because the client should be logged out regardless
    await clearAuthCookies()
    
    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    })
  }
}

export async function POST(request: NextRequest) {
  return withMiddleware(logoutHandler, {
    allowedMethods: ['POST'],
    requireAuth: false, // Don't require auth since user might have invalid token
    skipRateLimit: true
  })(request, {})
} 