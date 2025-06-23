import { NextRequest } from 'next/server'
import { withMiddleware, getValidatedBody } from '@/lib/api-middleware'
import { createSuccessResponse } from '@/lib/api-errors'
import { createWishlistItemSchema } from '@/lib/validations'
import { createWishlistItem } from '@/lib/wishlist-service'

export const POST = withMiddleware(async (request: NextRequest, { user }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const body = await getValidatedBody(request, createWishlistItemSchema)
  
  const item = await createWishlistItem({
    ...body,
    userId: user.id
  })
  
  return createSuccessResponse({
    item: {
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
      category: item.category
    }
  }, 201)
}, {
  requireAuth: true,
  allowedMethods: ['POST']
}) 