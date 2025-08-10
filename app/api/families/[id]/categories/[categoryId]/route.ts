import { NextRequest } from 'next/server'
import { withMiddleware, validateRequest } from '@/lib/api-middleware'
import { createSuccessResponse, createNotFoundError, createValidationError } from '@/lib/api-errors'
import { updateCategorySchema } from '@/lib/validations'

export const PUT = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id || !params?.categoryId) {
    throw new Error('Authentication, family ID and category ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id
  const categoryId = resolvedParams.categoryId

  const { db } = await import('@/lib/db')
  const { familyAuthMiddleware } = await import('@/lib/api-middleware')

  // Only admins can update categories
  await familyAuthMiddleware(user.id, familyId, 'ADMIN')

  const body = validateRequest(updateCategorySchema, await request.json())

  // Ensure category exists and belongs to this family
  const existing = await db.category.findUnique({ where: { id: categoryId } })
  if (!existing || existing.familyId !== familyId) {
    throw createNotFoundError('Category')
  }

  // Prevent renaming default "Other" if you want; for now allow updates except changing familyId/isDefault
  const updated = await db.category.update({
    where: { id: categoryId },
    data: {
      name: body.name ?? undefined,
      description: body.description ?? undefined,
    },
  })

  return createSuccessResponse({ category: updated })
}, {
  requireAuth: true,
  allowedMethods: ['PUT', 'DELETE']
})

export const DELETE = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user || !params?.id || !params?.categoryId) {
    throw new Error('Authentication, family ID and category ID required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams.id
  const categoryId = resolvedParams.categoryId

  const { db } = await import('@/lib/db')
  const { familyAuthMiddleware } = await import('@/lib/api-middleware')

  // Only admins can delete categories
  await familyAuthMiddleware(user.id, familyId, 'ADMIN')

  const existing = await db.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { wishlistItems: true } } },
  })

  if (!existing || existing.familyId !== familyId) {
    throw createNotFoundError('Category')
  }

  // Prevent deletion if items exist
  if (existing._count.wishlistItems > 0) {
    throw createValidationError('Cannot delete category with existing wishlist items')
  }

  await db.category.delete({ where: { id: categoryId } })

  return createSuccessResponse({ success: true })
}, {
  requireAuth: true,
  allowedMethods: ['PUT', 'DELETE']
})

