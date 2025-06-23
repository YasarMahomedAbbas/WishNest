import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { removeFamilyMember, deleteFamilyMemberAccount } from '@/lib/family-service'
import { createSuccessResponse } from '@/lib/api-errors'

export const DELETE = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id || !params?.userId) {
    throw new Error('Authentication, family ID, and user ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id
  const targetUserId = resolvedParams.userId
  
  // Check if we should delete the account completely
  const url = new URL(request.url)
  const deleteAccount = url.searchParams.get('deleteAccount') === 'true'
  
  if (deleteAccount) {
    await deleteFamilyMemberAccount(familyId, user.id, targetUserId)
    return createSuccessResponse({
      message: 'Family member account deleted successfully'
    })
  } else {
    await removeFamilyMember(familyId, user.id, targetUserId)
    return createSuccessResponse({
      message: 'Family member removed successfully'
    })
  }
}, {
  requireAuth: true,
  allowedMethods: ['DELETE']
}) 