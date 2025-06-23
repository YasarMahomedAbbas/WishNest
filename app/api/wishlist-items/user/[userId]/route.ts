import { NextRequest } from 'next/server'
import { withMiddleware, getValidatedQuery } from '@/lib/api-middleware'
import { createSuccessResponse, createNotFoundError } from '@/lib/api-errors'
import { wishlistQuerySchema } from '@/lib/validations'
import { getUserWishlistItems } from '@/lib/wishlist-service'

export const GET = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const resolvedParams = await params
  const userId = resolvedParams?.userId
  
  if (!userId) {
    throw createNotFoundError('User')
  }

  const query = getValidatedQuery(request, wishlistQuerySchema)
  
  const { items, totalCount } = await getUserWishlistItems(userId, user.id, query)
  
  return createSuccessResponse({
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price ? Number(item.price) : null,
      productUrl: item.productUrl,
      imageUrl: item.imageUrl,
      priority: item.priority,
      notes: item.notes,
      userId: item.userId,
      categoryId: item.categoryId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      user: item.user,
      category: item.category,
      ...(query.includeReservations && { reservations: item.reservations })
    })),
    pagination: {
      page: query.page || 1,
      limit: query.limit || 10,
      totalCount,
      totalPages: Math.ceil(totalCount / (query.limit || 10))
    }
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET']
}) 