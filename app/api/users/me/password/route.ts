import { NextRequest } from 'next/server'
import { withMiddleware, getValidatedBody } from '@/lib/api-middleware'
import { createSuccessResponse } from '@/lib/api-errors'
import { updatePasswordSchema } from '@/lib/validations'
import { updateUserPassword } from '@/lib/user-service'

// PUT /api/users/me/password - Update user password
export const PUT = withMiddleware(async (request: NextRequest, { user }) => {
  const body = await getValidatedBody(request, updatePasswordSchema)
  
  // Extract the fields needed for the service
  const { currentPassword, newPassword } = body
  
  await updateUserPassword(user!.id, {
    currentPassword,
    newPassword
  })
  
  return createSuccessResponse({
    message: 'Password updated successfully'
  })
}, {
  requireAuth: true,
  allowedMethods: ['PUT']
}) 