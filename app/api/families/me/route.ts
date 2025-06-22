import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware, getValidatedQuery } from '@/lib/api-middleware'
import { familyQuerySchema } from '@/lib/validations'
import { getUserFamilies } from '@/lib/family-utils'
import { createSuccessResponse } from '@/lib/api-errors'

export const GET = withMiddleware(async (request: NextRequest, { user }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const query = getValidatedQuery(request, familyQuerySchema)
  
  const families = await getUserFamilies(user.id, query.includeMembers)
  
  return createSuccessResponse({
    families: families.map(family => ({
      id: family.id,
      name: family.name,
      description: family.description,
      inviteCode: family.inviteCode,
      createdAt: family.createdAt,
      updatedAt: family.updatedAt,
      membershipRole: family.membershipRole,
      membershipStatus: family.membershipStatus,
      joinedAt: family.joinedAt,
      ...(query.includeMembers && family.members ? {
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
      } : {})
    }))
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET']
}) 