import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { generateUniqueInviteCode } from '@/lib/invite-codes'
import { familyAuthMiddleware } from '@/lib/api-middleware'
import { createSuccessResponse } from '@/lib/api-errors'
import { db } from '@/lib/db'

export const POST = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id) {
    throw new Error('Authentication and family ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id
  
  // Check if user is admin of this family
  await familyAuthMiddleware(user.id, familyId, 'ADMIN')
  
  // Generate new unique invite code
  const newInviteCode = await generateUniqueInviteCode()
  
  // Update family with new invite code
  const updatedFamily = await db.family.update({
    where: { id: familyId },
    data: { inviteCode: newInviteCode },
    select: {
      id: true,
      name: true,
      description: true,
      inviteCode: true,
      updatedAt: true
    }
  })
  
  return createSuccessResponse({
    message: 'Invite code regenerated successfully',
    family: {
      id: updatedFamily.id,
      name: updatedFamily.name,
      description: updatedFamily.description,
      inviteCode: updatedFamily.inviteCode,
      updatedAt: updatedFamily.updatedAt
    }
  })
}, {
  requireAuth: true,
  allowedMethods: ['POST']
}) 