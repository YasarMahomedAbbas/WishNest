import { db } from './db'
import { createAuthorizationError, createValidationError } from './api-errors'
import { generateUniqueInviteCode } from './invite-codes'
import type { FamilyMemberRole, FamilyMemberStatus } from '@prisma/client'

export interface CreateFamilyData {
  name: string
  description?: string
  creatorUserId: string
}

export interface UpdateFamilyData {
  name?: string
  description?: string
}

export interface FamilyWithMembers {
  id: string
  name: string
  description: string | null
  inviteCode: string
  createdAt: Date
  updatedAt: Date
  members: Array<{
    id: string
    userId: string
    role: FamilyMemberRole
    status: FamilyMemberStatus
    joinedAt: Date
    user: {
      id: string
      name: string
      email: string
    }
  }>
}

/**
 * Creates a new family with the creator as admin
 */
export async function createFamily(data: CreateFamilyData) {
  const inviteCode = await generateUniqueInviteCode()
  
  // Create family and add creator as admin in a transaction
  const result = await db.$transaction(async (tx) => {
    const family = await tx.family.create({
      data: {
        name: data.name,
        description: data.description,
        inviteCode,
      }
    })
    
    // Add creator as admin
    await tx.familyMember.create({
      data: {
        userId: data.creatorUserId,
        familyId: family.id,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    })
    
    // Create default categories for the family
    const defaultCategories = [
      { name: 'Electronics', description: 'Gadgets, devices, and tech accessories' },
      { name: 'Books', description: 'Books, e-books, and reading materials' },
      { name: 'Games', description: 'Video games, board games, and toys' },
      { name: 'Home & Garden', description: 'Home decor, furniture, and garden items' },
      { name: 'Fashion', description: 'Clothing, shoes, and accessories' },
      { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
      { name: 'Health & Beauty', description: 'Skincare, makeup, and health products' },
      { name: 'Other', description: 'Everything else' },
    ]
    
    await tx.category.createMany({
      data: defaultCategories.map(cat => ({
        name: cat.name,
        description: cat.description,
        familyId: family.id,
        isDefault: true
      }))
    })
    
    return family
  })
  
  return result
}

/**
 * Gets all families for a user
 */
export async function getUserFamilies(userId: string, includeMembers = false) {
  const familyMembers = await db.familyMember.findMany({
    where: {
      userId,
      status: 'ACTIVE'
    },
    include: {
      family: {
        include: includeMembers ? {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            where: {
              status: 'ACTIVE'
            },
            orderBy: [
              { role: 'asc' }, // ADMIN first
              { joinedAt: 'asc' }
            ]
          }
        } : false
      }
    },
    orderBy: { joinedAt: 'asc' }
  })
  
  return familyMembers.map(fm => ({
    ...fm.family,
    membershipRole: fm.role,
    membershipStatus: fm.status,
    joinedAt: fm.joinedAt
  }))
}

/**
 * Gets a single family with member details
 */
export async function getFamilyWithMembers(familyId: string): Promise<FamilyWithMembers | null> {
  const family = await db.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        where: {
          status: 'ACTIVE'
        },
        orderBy: [
          { role: 'asc' }, // ADMIN first
          { joinedAt: 'asc' }
        ]
      }
    }
  })
  
  return family as FamilyWithMembers | null
}

/**
 * Updates family settings (admin only)
 */
export async function updateFamily(familyId: string, userId: string, data: UpdateFamilyData) {
  // Check if user is admin
  const membership = await db.familyMember.findUnique({
    where: {
      userId_familyId: {
        userId,
        familyId
      }
    }
  })
  
  if (!membership || membership.role !== 'ADMIN' || membership.status !== 'ACTIVE') {
    throw createAuthorizationError('Only family admins can update family settings')
  }
  
  return await db.family.update({
    where: { id: familyId },
    data
  })
}

/**
 * Removes a member from a family (admin only, cannot remove other admins)
 */
export async function removeFamilyMember(familyId: string, adminUserId: string, targetUserId: string) {
  // Cannot remove yourself
  if (adminUserId === targetUserId) {
    throw createValidationError('You cannot remove yourself from the family')
  }
  
  // Check admin permissions and get target member info in one query
  const [adminMembership, targetMembership] = await Promise.all([
    db.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: adminUserId,
          familyId
        }
      }
    }),
    db.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: targetUserId,
          familyId
        }
      }
    })
  ])
  
  if (!adminMembership || adminMembership.role !== 'ADMIN' || adminMembership.status !== 'ACTIVE') {
    throw createAuthorizationError('Only family admins can remove members')
  }
  
  if (!targetMembership || targetMembership.status !== 'ACTIVE') {
    throw createValidationError('User is not an active member of this family')
  }
  
  if (targetMembership.role === 'ADMIN') {
    throw createAuthorizationError('Cannot remove other family admins')
  }
  
  // Remove the member
  await db.familyMember.delete({
    where: {
      userId_familyId: {
        userId: targetUserId,
        familyId
      }
    }
  })
  
  return { success: true }
}

/**
 * Deletes a family (admin only, must be the only remaining member)
 */
export async function deleteFamily(familyId: string, userId: string) {
  // Check if user is admin
  const membership = await db.familyMember.findUnique({
    where: {
      userId_familyId: {
        userId,
        familyId
      }
    }
  })
  
  if (!membership || membership.role !== 'ADMIN' || membership.status !== 'ACTIVE') {
    throw createAuthorizationError('Only family admins can delete families')
  }
  
  // Count active members
  const memberCount = await db.familyMember.count({
    where: {
      familyId,
      status: 'ACTIVE'
    }
  })
  
  if (memberCount > 1) {
    throw createValidationError('Cannot delete family with other active members. Remove all other members first.')
  }
  
  // Delete family (cascade will handle related records)
  await db.family.delete({
    where: { id: familyId }
  })
  
  return { success: true }
}

/**
 * Gets family member count and role distribution
 */
export async function getFamilyStats(familyId: string) {
  const stats = await db.familyMember.groupBy({
    by: ['role'],
    where: {
      familyId,
      status: 'ACTIVE'
    },
    _count: {
      _all: true
    }
  })
  
  const result = {
    totalMembers: 0,
    adminCount: 0,
    memberCount: 0
  }
  
  stats.forEach(stat => {
    result.totalMembers += stat._count._all
    if (stat.role === 'ADMIN') {
      result.adminCount = stat._count._all
    } else {
      result.memberCount = stat._count._all
    }
  })
  
  return result
}

/**
 * Checks if a family has reached the maximum member limit
 */
export async function checkFamilyMemberLimit(familyId: string, maxMembers = 20): Promise<boolean> {
  const memberCount = await db.familyMember.count({
    where: {
      familyId,
      status: 'ACTIVE'
    }
  })
  
  return memberCount >= maxMembers
}

/**
 * Creates a shareable invite link for a family
 */
export function createInviteLink(inviteCode: string, baseUrl?: string): string {
  const domain = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${domain}/invite/${inviteCode}`
}

/**
 * Gets family invite information (for sharing)
 */
export async function getFamilyInviteInfo(familyId: string, userId: string) {
  // Check if user is admin
  const membership = await db.familyMember.findUnique({
    where: {
      userId_familyId: {
        userId,
        familyId
      }
    }
  })
  
  if (!membership || membership.role !== 'ADMIN' || membership.status !== 'ACTIVE') {
    throw createAuthorizationError('Only family admins can access invite information')
  }
  
  const family = await db.family.findUnique({
    where: { id: familyId },
    select: {
      id: true,
      name: true,
      description: true,
      inviteCode: true
    }
  })
  
  if (!family) {
    throw createValidationError('Family not found')
  }
  
  const stats = await getFamilyStats(familyId)
  
  return {
    family: {
      id: family.id,
      name: family.name,
      description: family.description,
      inviteCode: family.inviteCode,
      memberCount: stats.totalMembers,
      isAtMemberLimit: stats.totalMembers >= 20
    },
    inviteLink: createInviteLink(family.inviteCode)
  }
} 