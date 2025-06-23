import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { promoteFamilyMemberToAdmin } from '@/lib/family-service'
import { createSuccessResponse } from '@/lib/api-errors'

export const POST = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id || !params?.userId) {
    throw new Error('Authentication, family ID, and user ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id
  const targetUserId = resolvedParams.userId
  
  await promoteFamilyMemberToAdmin(familyId, user.id, targetUserId)
  
  return createSuccessResponse({
    message: 'Family member promoted to admin successfully'
  })
}, {
  requireAuth: true,
  allowedMethods: ['POST']
}) 