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
  
  // Get user's current family memberships
  const currentMemberships = await db.familyMember.findMany({
    where: {
      userId: user.id,
      status: 'ACTIVE'
    },
    include: {
      family: true
    }
  })
  
  // Check if user is already a member of the target family
  const existingMembership = currentMemberships.find(m => m.familyId === familyId)
  
  if (existingMembership) {
    throw createConflictError('You are already a member of this family')
  }
  
  // Check family member limit for the new family
  const isAtLimit = await checkFamilyMemberLimit(familyId)
  if (isAtLimit) {
    throw createValidationError('This family has reached the maximum number of members (20)')
  }
  
  // Get the new family info
  const newFamily = await db.family.findUnique({
    where: { id: familyId }
  })
  
  if (!newFamily) {
    throw createValidationError('Family not found')
  }
  
  // Perform the leave current family and join new family operation in a transaction
  const result = await db.$transaction(async (tx) => {
    // Remove user from all current families (in single family mode)
    if (currentMemberships.length > 0) {
      await tx.familyMember.deleteMany({
        where: {
          userId: user.id,
          status: 'ACTIVE'
        }
      })
    }
    
    // Add user to the new family
    const newMembership = await tx.familyMember.create({
      data: {
        userId: user.id,
        familyId,
        role: 'MEMBER',
        status: 'ACTIVE'
      }
    })
    
    return newMembership
  })
  
  return createSuccessResponse({
    message: currentMemberships.length > 0 
      ? `Successfully left ${currentMemberships[0].family.name} and joined ${newFamily.name}`
      : `Successfully joined ${newFamily.name}`,
    family: {
      id: newFamily.id,
      name: newFamily.name,
      description: newFamily.description,
      inviteCode: newFamily.inviteCode,
      membershipRole: result.role,
      joinedAt: result.joinedAt
    },
    leftFamilies: currentMemberships.map(m => ({
      id: m.family.id,
      name: m.family.name
    }))
  }, 201)
}, {
  requireAuth: true,
  allowedMethods: ['POST']
})