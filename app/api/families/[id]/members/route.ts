import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { getFamilyWithMembers } from '@/lib/family-utils'
import { familyAuthMiddleware } from '@/lib/api-middleware'
import { createSuccessResponse, createNotFoundError } from '@/lib/api-errors'

export const GET = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id) {
    throw new Error('Authentication and family ID required')
  }

  const familyId = params.id
  
  // Check if user is a member of this family
  await familyAuthMiddleware(user.id, familyId)
  
  const family = await getFamilyWithMembers(familyId)
  
  if (!family) {
    throw createNotFoundError('Family not found')
  }
  
  return createSuccessResponse({
    members: family.members.map(member => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email
      }
    }))
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET']
}) 