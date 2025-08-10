import { NextRequest } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { createSuccessResponse, createAuthorizationError } from '@/lib/api-errors'
import { db } from '@/lib/db'

export const GET = withMiddleware(async (request, { user }) => {
  // Check if user is admin
  if (!user?.isAdmin) {
    throw createAuthorizationError('Admin access required')
  }

  // Get all users with their family memberships
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      failedLoginAttempts: true,
      lockoutUntil: true,
      familyMembers: {
        where: {
          status: 'ACTIVE'
        },
        select: {
          id: true,
          role: true,
          status: true,
          joinedAt: true,
          family: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          joinedAt: 'desc'
        }
      },
      _count: {
        select: {
          wishlistItems: true,
          itemReservations: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Transform the data for better readability
  const transformedUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    accountLocked: user.lockoutUntil ? user.lockoutUntil > new Date() : false,
    failedLoginAttempts: user.failedLoginAttempts,
    statistics: {
      wishlistItems: user._count.wishlistItems,
      reservations: user._count.itemReservations,
      familyMemberships: user.familyMembers.length
    },
    families: user.familyMembers.map(membership => ({
      membershipId: membership.id,
      role: membership.role,
      status: membership.status,
      joinedAt: membership.joinedAt,
      family: {
        id: membership.family.id,
        name: membership.family.name
      }
    }))
  }))

  return createSuccessResponse({
    users: transformedUsers,
    totalCount: users.length,
    adminCount: users.filter(u => u.isAdmin).length
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET']
})