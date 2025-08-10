import { NextRequest } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { createSuccessResponse, createAuthorizationError } from '@/lib/api-errors'
import { db } from '@/lib/db'

export const GET = withMiddleware(async (request, { user }) => {
  // Check if user is admin
  if (!user?.isAdmin) {
    throw createAuthorizationError('Admin access required')
  }

  // Get all families with member counts and basic info
  const families = await db.family.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      inviteCode: true,
      createdAt: true,
      updatedAt: true,
      members: {
        where: {
          status: 'ACTIVE'
        },
        select: {
          id: true,
          role: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          joinedAt: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Transform the data for better readability
  const transformedFamilies = families.map(family => ({
    id: family.id,
    name: family.name,
    description: family.description,
    inviteCode: family.inviteCode,
    createdAt: family.createdAt,
    updatedAt: family.updatedAt,
    memberCount: family.members.length,
    members: family.members.map(member => ({
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email
      }
    }))
  }))

  return createSuccessResponse({
    families: transformedFamilies,
    totalCount: families.length
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET']
})