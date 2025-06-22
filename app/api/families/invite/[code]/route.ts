import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { validateInviteCode } from '@/lib/invite-codes'
import { getFamilyStats } from '@/lib/family-utils'
import { createSuccessResponse, createValidationError } from '@/lib/api-errors'
import { db } from '@/lib/db'

export const GET = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!params?.code) {
    throw createValidationError('Invite code is required')
  }

  const resolvedParams = await params
  const inviteCode = resolvedParams.code
  
  // Validate invite code and get family ID
  const { valid, familyId } = await validateInviteCode(inviteCode)
  
  if (!valid || !familyId) {
    throw createValidationError('Invalid invite code')
  }
  
  // Get family information (public info only)
  const family = await db.family.findUnique({
    where: { id: familyId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true
    }
  })
  
  if (!family) {
    throw createValidationError('Family not found')
  }
  
  // Get family stats
  const stats = await getFamilyStats(familyId)
  
  // Check if current user is already a member (if authenticated)
  let currentMembership = null
  if (user) {
    currentMembership = await db.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: user.id,
          familyId
        }
      },
      select: {
        role: true,
        status: true,
        joinedAt: true
      }
    })
  }
  
  return createSuccessResponse({
    family: {
      id: family.id,
      name: family.name,
      description: family.description,
      createdAt: family.createdAt,
      memberCount: stats.totalMembers,
      isAtMemberLimit: stats.totalMembers >= 20
    },
    currentMembership: currentMembership ? {
      role: currentMembership.role,
      status: currentMembership.status,
      joinedAt: currentMembership.joinedAt
    } : null
  })
}, {
  requireAuth: false, // Allow unauthenticated users to preview
  allowedMethods: ['GET']
}) 