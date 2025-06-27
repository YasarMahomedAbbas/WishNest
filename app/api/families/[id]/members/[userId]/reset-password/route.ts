import { NextRequest } from 'next/server'
import { withMiddleware, getValidatedBody } from '@/lib/api-middleware'
import { createSuccessResponse } from '@/lib/api-errors'
import { resetPasswordSchema } from '@/lib/validations'
import { resetUserPassword } from '@/lib/user-service'

// POST /api/families/[id]/members/[userId]/reset-password - Reset member password (admin only)
export const POST = withMiddleware(async (request: NextRequest, { user, params }) => {
  const resolvedParams = await params
  const familyId = resolvedParams!.id
  const targetUserId = resolvedParams!.userId
  
  const body = await getValidatedBody(request, resetPasswordSchema)
  
  await resetUserPassword(user!.id, targetUserId, familyId, body.newPassword)
  
  return createSuccessResponse({
    message: 'Password reset successfully'
  })
}, {
  requireAuth: true,
  allowedMethods: ['POST']
}) 