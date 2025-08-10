import { NextRequest } from 'next/server'
import { withMiddleware, validateRequest } from '@/lib/api-middleware'
import { createSuccessResponse, createNotFoundError, createValidationError } from '@/lib/api-errors'
import { createCategorySchema } from '@/lib/validations'

export const GET = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id) {
    throw new Error('Authentication and family ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id

  const { familyAuthMiddleware } = await import('@/lib/api-middleware')
  const { db } = await import('@/lib/db')

  // Any member can view categories within their family
  await familyAuthMiddleware(user.id, familyId)

  const categories = await db.category.findMany({
    where: { familyId },
    orderBy: { name: 'asc' },
  })

  return createSuccessResponse({ categories })
}, {
  requireAuth: true,
  allowedMethods: ['GET', 'POST']
})

export const POST = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id) {
    throw new Error('Authentication and family ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id

  const { db } = await import('@/lib/db')
  const { familyAuthMiddleware } = await import('@/lib/api-middleware')

  // Only admins can create categories
  await familyAuthMiddleware(user.id, familyId, 'ADMIN')

  const raw = await request.json()
  const body = validateRequest(createCategorySchema, { ...raw, familyId })

  try {
    const created = await db.category.create({
      data: {
        name: body.name,
        description: body.description,
        familyId: body.familyId,
        isDefault: false,
      },
    })
    return createSuccessResponse({ category: created }, 201)
  } catch (error: any) {
    // Handle unique constraint on (name, familyId)
    if (error?.code === 'P2002') {
      throw createValidationError('A category with this name already exists in this family')
    }
    throw error
  }
}, {
  requireAuth: true,
  allowedMethods: ['GET', 'POST']
})

