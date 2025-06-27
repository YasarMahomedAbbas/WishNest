import { NextRequest } from 'next/server'
import { withMiddleware, getValidatedBody } from '@/lib/api-middleware'
import { createSuccessResponse } from '@/lib/api-errors'
import { updateUserSchema } from '@/lib/validations'
import { updateUser } from '@/lib/user-service'
import { db } from '@/lib/db'

// GET /api/users/me - Get current user profile
export const GET = withMiddleware(async (request: NextRequest, { user }) => {
  const userProfile = await db.user.findUnique({
    where: { id: user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return createSuccessResponse({
    user: userProfile
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET', 'PUT']
})

// PUT /api/users/me - Update user profile
export const PUT = withMiddleware(async (request: NextRequest, { user }) => {
  const body = await getValidatedBody(request, updateUserSchema)
  
  const updatedUser = await updateUser(user!.id, body)
  
  return createSuccessResponse({
    user: updatedUser,
    message: 'Profile updated successfully'
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET', 'PUT']
}) 