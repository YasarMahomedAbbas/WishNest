import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db } from './db'
import { ApiError, ApiErrorCode, createAuthenticationError, createAuthorizationError, createRateLimitError, errorResponse } from './api-errors'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// CORS configuration
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.NEXTAUTH_URL,
].filter(Boolean)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Will be set dynamically
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
}

// Types
export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    name: string
    isAdmin: boolean
  }
}

export interface RequestContext {
  params?: Record<string, string>
  user?: {
    id: string
    email: string
    name: string
    isAdmin: boolean
  } | null
}

// JWT Token verification
export async function verifyToken(token: string): Promise<any> {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set')
    }
    
    return jwt.verify(token, secret)
  } catch (error) {
    throw createAuthenticationError('Invalid or expired token')
  }
}

// Get user from token
export async function getUserFromToken(token: string) {
  const decoded = await verifyToken(token)
  
  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  })
  
  if (!user) {
    throw createAuthenticationError('User not found')
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: (user as any).isAdmin ?? false,
  }
}

// CORS middleware
export function corsMiddleware(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin')
  
  // Set CORS headers
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }
  
  response.headers.set('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods'])
  response.headers.set('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers'])
  response.headers.set('Access-Control-Allow-Credentials', CORS_HEADERS['Access-Control-Allow-Credentials'])
  
  return response
}

// Rate limiting middleware
export function rateLimitMiddleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const key = `rate_limit:${ip}`
  const now = Date.now()
  const windowMs = parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes
  const maxRequests = parseInt(process.env.API_RATE_LIMIT_REQUESTS || '100')
  
  // Clean up expired entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetTime < now) {
      rateLimitStore.delete(k)
    }
  }
  
  const current = rateLimitStore.get(key)
  
  if (!current) {
    // First request from this IP
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (current.resetTime < now) {
    // Window has expired, reset
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (current.count >= maxRequests) {
    // Rate limit exceeded
    throw createRateLimitError(`Too many requests. Try again in ${Math.ceil((current.resetTime - now) / 1000)} seconds.`)
  }
  
  // Increment count
  current.count++
  return true
}

// Authentication middleware
export async function authMiddleware(request: NextRequest): Promise<{ id: string; email: string; name: string; isAdmin: boolean }> {
  // First try Authorization header
  const authHeader = request.headers.get('authorization')
  let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  
  // If no Authorization header, try cookies
  if (!token) {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    token = cookieStore.get('access_token')?.value || null
  }
  
  if (!token) {
    throw createAuthenticationError('Authorization token is required')
  }
  
  return await getUserFromToken(token)
}

// Optional authentication middleware (doesn't throw if no token)
export async function optionalAuthMiddleware(request: NextRequest): Promise<{ id: string; email: string; name: string; isAdmin: boolean } | null> {
  try {
    return await authMiddleware(request)
  } catch {
    return null
  }
}

// Admin authentication middleware
export async function adminAuthMiddleware(request: NextRequest): Promise<{ id: string; email: string; name: string; isAdmin: boolean }> {
  const user = await authMiddleware(request)
  
  if (!user.isAdmin) {
    throw createAuthorizationError('Admin access required')
  }
  
  return user
}

// Authorization middleware for family access
export async function familyAuthMiddleware(userId: string, familyId: string, requiredRole?: 'ADMIN' | 'MEMBER') {
  const membership = await db.familyMember.findUnique({
    where: {
      userId_familyId: {
        userId,
        familyId
      }
    },
    include: {
      family: true
    }
  })
  
  if (!membership) {
    throw createAuthorizationError('You are not a member of this family')
  }
  
  if (membership.status !== 'ACTIVE') {
    throw createAuthorizationError('Your family membership is not active')
  }
  
  if (requiredRole === 'ADMIN' && membership.role !== 'ADMIN') {
    throw createAuthorizationError('Admin access required')
  }
  
  return membership
}

// Resource ownership middleware
export async function resourceOwnershipMiddleware(userId: string, resourceType: string, resourceId: string) {
  let resource
  
  switch (resourceType) {
    case 'wishlist_item':
      resource = await db.wishlistItem.findUnique({
        where: { id: resourceId },
        select: { userId: true }
      })
      break
    case 'reservation':
      resource = await db.itemReservation.findUnique({
        where: { id: resourceId },
        select: { userId: true }
      })
      break
    default:
      throw new ApiError(ApiErrorCode.VALIDATION_ERROR, 'Invalid resource type', 400)
  }
  
  if (!resource) {
    throw createAuthorizationError('Resource not found')
  }
  
  if (resource.userId !== userId) {
    throw createAuthorizationError('You can only access your own resources')
  }
  
  return resource
}

// Request validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

// Main API middleware wrapper
export function withMiddleware(
  handler: (request: NextRequest, context: RequestContext) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    allowedMethods?: string[]
    skipRateLimit?: boolean
  } = {}
) {
  return async (request: NextRequest, context: { params?: Record<string, string> } = {}) => {
    try {
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 })
        return corsMiddleware(request, response)
      }
      
      // Check allowed methods
      if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
        return errorResponse(
          new ApiError(ApiErrorCode.VALIDATION_ERROR, `Method ${request.method} not allowed`, 405),
          405,
          request.url
        )
      }
      
      // Apply rate limiting (skip for development or if disabled)
      if (!options.skipRateLimit && process.env.NODE_ENV !== 'development') {
        rateLimitMiddleware(request)
      }
      
      // Apply authentication if required
      let user = null
      if (options.requireAuth) {
        user = await authMiddleware(request)
      } else {
        user = await optionalAuthMiddleware(request)
      }
      
      // Create request context
      const requestContext: RequestContext = {
        params: context.params,
        user
      }
      
      // Call the handler
      const response = await handler(request, requestContext)
      
      // Apply CORS headers
      return corsMiddleware(request, response)
      
    } catch (error) {
      console.error('API Error:', error)
      const response = errorResponse(error, undefined, request.url)
      return corsMiddleware(request, response)
    }
  }
}

// Utility function to get request body with validation
export async function getValidatedBody<T>(request: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json()
    return validateRequest(schema, body)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ApiError(ApiErrorCode.VALIDATION_ERROR, 'Invalid JSON in request body', 400)
    }
    throw error
  }
}

// Utility function to get validated query parameters
export function getValidatedQuery<T>(request: NextRequest, schema: z.ZodSchema<T>): T {
  const { searchParams } = new URL(request.url)
  const query = Object.fromEntries(searchParams.entries())
  return validateRequest(schema, query)
} 