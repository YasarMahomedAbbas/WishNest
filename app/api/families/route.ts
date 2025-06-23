import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware, getValidatedBody } from '@/lib/api-middleware'
import { createFamilySchema } from '@/lib/validations'
import { createFamily } from '@/lib/family-service'
import { createSuccessResponse } from '@/lib/api-errors'

export const POST = withMiddleware(async (request: NextRequest, { user }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const body = await getValidatedBody(request, createFamilySchema)
  
  const family = await createFamily({
    name: body.name,
    description: body.description,
    creatorUserId: user.id
  })
  
  return createSuccessResponse({
    family: {
      id: family.id,
      name: family.name,
      description: family.description,
      inviteCode: family.inviteCode,
      createdAt: family.createdAt,
      updatedAt: family.updatedAt
    }
  }, 201)
}, {
  requireAuth: true,
  allowedMethods: ['POST']
}) 