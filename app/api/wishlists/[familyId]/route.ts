import { NextRequest } from 'next/server'
import { withMiddleware, getValidatedQuery } from '@/lib/api-middleware'
import { createSuccessResponse, createNotFoundError } from '@/lib/api-errors'
import { wishlistQuerySchema } from '@/lib/validations'
import { getFamilyWishlistItems } from '@/lib/wishlist-service'
import { filterItemForUser } from '@/lib/wishlist-utils'

export const GET = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const resolvedParams = await params
  const familyId = resolvedParams?.familyId
  
  if (!familyId) {
    throw createNotFoundError('Family')
  }

  const query = getValidatedQuery(request, wishlistQuerySchema)
  
  const { items, totalCount } = await getFamilyWishlistItems(familyId, user.id, {
    ...query,
    includeReservations: true  // Always include reservations to calculate status
  })
  
  return createSuccessResponse({
    items: items.map(item => {
      const filteredItem = filterItemForUser(item, user.id)
      return {
        id: filteredItem.id,
        title: filteredItem.title,
        description: filteredItem.description,
        price: filteredItem.price ? Number(filteredItem.price) : null,
        productUrl: filteredItem.productUrl,
        imageUrl: filteredItem.imageUrl,
        priority: filteredItem.priority,
        notes: filteredItem.notes,
        userId: filteredItem.userId,
        categoryId: filteredItem.categoryId,
        createdAt: filteredItem.createdAt,
        updatedAt: filteredItem.updatedAt,
        user: filteredItem.user,
        category: filteredItem.category,
        status: filteredItem.status,
        reservationDetails: filteredItem.reservationDetails,
        ...(query.includeReservations && { reservations: filteredItem.reservations })
      }
    }),
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