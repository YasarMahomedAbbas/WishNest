import { NextRequest, NextResponse } from 'next/server'
import { withMiddleware, getValidatedBody, getValidatedQuery } from '@/lib/api-middleware'
import { updateFamilySchema, familyQuerySchema } from '@/lib/validations'
import { getFamilyWithMembers, updateFamily, deleteFamily } from '@/lib/family-service'
import { familyAuthMiddleware } from '@/lib/api-middleware'
import { createSuccessResponse, createNotFoundError } from '@/lib/api-errors'

export const GET = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id) {
    throw new Error('Authentication and family ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id
  const query = getValidatedQuery(request, familyQuerySchema)
  
  // Check if user is a member of this family
  await familyAuthMiddleware(user.id, familyId)
  
  const family = await getFamilyWithMembers(familyId)
  
  if (!family) {
    throw createNotFoundError('Family not found')
  }
  
  // Load categories if requested
  let categories = []
  if (query.includeCategories) {
    const { db } = await import('@/lib/db')
    categories = await db.category.findMany({
      where: { familyId },
      orderBy: { name: 'asc' }
    })
  }
  
  return createSuccessResponse({
    family: {
      id: family.id,
      name: family.name,
      description: family.description,
      inviteCode: family.inviteCode,
      createdAt: family.createdAt,
      updatedAt: family.updatedAt,
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
      })),
      ...(query.includeCategories && { categories })
    }
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET', 'PUT', 'DELETE']
})

export const PUT = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id) {
    throw new Error('Authentication and family ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id
  const body = await getValidatedBody(request, updateFamilySchema)
  
  const updatedFamily = await updateFamily(familyId, user.id, body)
  
  return createSuccessResponse({
    family: {
      id: updatedFamily.id,
      name: updatedFamily.name,
      description: updatedFamily.description,
      inviteCode: updatedFamily.inviteCode,
      createdAt: updatedFamily.createdAt,
      updatedAt: updatedFamily.updatedAt
    }
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET', 'PUT', 'DELETE']
})

export const DELETE = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id) {
    throw new Error('Authentication and family ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id
  
  await deleteFamily(familyId, user.id)
  
  return createSuccessResponse({
    message: 'Family deleted successfully'
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET', 'PUT', 'DELETE']
}) 