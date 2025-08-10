import { NextRequest } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { createSuccessResponse, createAuthorizationError } from '@/lib/api-errors'
import { db } from '@/lib/db'

export const GET = withMiddleware(async (request, { user }) => {
  // Check if user is admin
  if (!user?.isAdmin) {
    throw createAuthorizationError('Admin access required')
  }

  // Get comprehensive system statistics
  const [
    totalUsers,
    totalFamilies,
    totalWishlistItems,
    totalReservations,
    activeFamilyMemberships,
    recentUsers,
    recentFamilies,
    adminUsers,
    lockedUsers
  ] = await Promise.all([
    // Basic counts
    db.user.count(),
    db.family.count(),
    db.wishlistItem.count(),
    db.itemReservation.count(),
    
    // Active memberships
    db.familyMember.count({
      where: { status: 'ACTIVE' }
    }),
    
    // Recent activity (last 30 days)
    db.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    
    db.family.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    
    // Admin and locked users
    db.user.count({
      where: { isAdmin: true }
    }),
    
    db.user.count({
      where: {
        lockoutUntil: {
          gt: new Date()
        }
      }
    })
  ])

  // Get family size distribution
  const familySizeDistribution = await db.family.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          members: {
            where: {
              status: 'ACTIVE'
            }
          }
        }
      }
    }
  })

  // Calculate family size stats
  const familySizes = familySizeDistribution.map(f => f._count.members)
  const avgFamilySize = familySizes.length > 0 
    ? familySizes.reduce((sum, size) => sum + size, 0) / familySizes.length 
    : 0

  // Get top active families by wishlist items
  const topFamilies = await db.family.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          members: {
            where: { status: 'ACTIVE' }
          }
        }
      },
      members: {
        where: { status: 'ACTIVE' },
        select: {
          user: {
            select: {
              _count: {
                select: {
                  wishlistItems: true
                }
              }
            }
          }
        }
      }
    },
    take: 5
  })

  const topFamiliesWithStats = topFamilies.map(family => ({
    id: family.id,
    name: family.name,
    memberCount: family._count.members,
    totalWishlistItems: family.members.reduce(
      (sum, member) => sum + member.user._count.wishlistItems, 
      0
    )
  })).sort((a, b) => b.totalWishlistItems - a.totalWishlistItems)

  return createSuccessResponse({
    overview: {
      totalUsers,
      totalFamilies,
      totalWishlistItems,
      totalReservations,
      activeFamilyMemberships,
      adminUsers,
      lockedUsers
    },
    recent: {
      newUsersLast30Days: recentUsers,
      newFamiliesLast30Days: recentFamilies
    },
    familyStats: {
      averageFamilySize: Math.round(avgFamilySize * 100) / 100,
      smallFamilies: familySizes.filter(size => size <= 2).length,
      mediumFamilies: familySizes.filter(size => size > 2 && size <= 5).length,
      largeFamilies: familySizes.filter(size => size > 5).length
    },
    topFamilies: topFamiliesWithStats,
    systemHealth: {
      totalUsers,
      activeUsers: totalUsers - lockedUsers,
      lockedUsers,
      adminUsers,
      healthScore: Math.round(((totalUsers - lockedUsers) / Math.max(totalUsers, 1)) * 100)
    }
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET']
})