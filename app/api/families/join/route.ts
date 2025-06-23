import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware, getValidatedBody } from '@/lib/api-middleware'
import { joinFamilySchema } from '@/lib/validations'
import { validateInviteCode } from '@/lib/invite-codes'
import { checkFamilyMemberLimit } from '@/lib/family-service'
import { createSuccessResponse, createValidationError, createConflictError } from '@/lib/api-errors'
import { db } from '@/lib/db'

export const POST = withMiddleware(async (request: NextRequest, { user }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const body = await getValidatedBody(request, joinFamilySchema)
  
  // Validate invite code and get family ID
  const { valid, familyId } = await validateInviteCode(body.inviteCode)
  
  if (!valid || !familyId) {
    throw createValidationError('Invalid invite code')
  }
  
  // Check if user is already a member of this family
  const existingMembership = await db.familyMember.findUnique({
    where: {
      userId_familyId: {
        userId: user.id,
        familyId
      }
    }
  })
  
  if (existingMembership) {
    if (existingMembership.status === 'ACTIVE') {
      throw createConflictError('You are already a member of this family')
    } else {
      // Reactivate existing membership
      const updatedMembership = await db.familyMember.update({
        where: {
          userId_familyId: {
            userId: user.id,
            familyId
          }
        },
        data: { status: 'ACTIVE' },
        include: {
          family: true
        }
      })
      
      return createSuccessResponse({
        message: 'Successfully rejoined family',
        family: {
          id: updatedMembership.family.id,
          name: updatedMembership.family.name,
          description: updatedMembership.family.description,
          inviteCode: updatedMembership.family.inviteCode,
          membershipRole: updatedMembership.role,
          joinedAt: updatedMembership.joinedAt
        }
      })
    }
  }
  
  // Check family member limit
  const isAtLimit = await checkFamilyMemberLimit(familyId)
  if (isAtLimit) {
    throw createValidationError('This family has reached the maximum number of members (20)')
  }
  
  // Add user to family
  const newMembership = await db.familyMember.create({
    data: {
      userId: user.id,
      familyId,
      role: 'MEMBER',
      status: 'ACTIVE'
    },
    include: {
      family: true
    }
  })
  
  return createSuccessResponse({
    message: 'Successfully joined family',
    family: {
      id: newMembership.family.id,
      name: newMembership.family.name,
      description: newMembership.family.description,
      inviteCode: newMembership.family.inviteCode,
      membershipRole: newMembership.role,
      joinedAt: newMembership.joinedAt
    }
  }, 201)
}, {
  requireAuth: true,
  allowedMethods: ['POST']
}) 