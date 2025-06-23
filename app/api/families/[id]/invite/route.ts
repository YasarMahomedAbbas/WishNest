import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { getFamilyInviteInfo } from '@/lib/family-service'
import { createSuccessResponse } from '@/lib/api-errors'

export const GET = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id) {
    throw new Error('Authentication and family ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id
  
  const inviteInfo = await getFamilyInviteInfo(familyId, user.id)
  
  return createSuccessResponse(inviteInfo)
}, {
  requireAuth: true,
  allowedMethods: ['GET']
}) 