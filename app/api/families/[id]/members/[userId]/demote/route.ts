import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { demoteFamilyAdminToMember } from '@/lib/family-service'
import { createSuccessResponse } from '@/lib/api-errors'

export const POST = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id || !params?.userId) {
    throw new Error('Authentication, family ID, and user ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id
  const targetUserId = resolvedParams.userId
  
  await demoteFamilyAdminToMember(familyId, user.id, targetUserId)
  
  return createSuccessResponse({
    message: 'Family admin demoted to member successfully'
  })
}, {
  requireAuth: true,
  allowedMethods: ['POST']
}) 