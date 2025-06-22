import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { removeFamilyMember } from '@/lib/family-utils'
import { createSuccessResponse } from '@/lib/api-errors'

export const DELETE = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id || !params?.userId) {
    throw new Error('Authentication, family ID, and user ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id
  const targetUserId = resolvedParams.userId
  
  await removeFamilyMember(familyId, user.id, targetUserId)
  
  return createSuccessResponse({
    message: 'Family member removed successfully'
  })
}, {
  requireAuth: true,
  allowedMethods: ['DELETE']
}) 