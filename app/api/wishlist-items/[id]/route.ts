import { NextRequest } from 'next/server'
import { withMiddleware, getValidatedBody, getValidatedQuery } from '@/lib/api-middleware'
import { createSuccessResponse, createNotFoundError } from '@/lib/api-errors'
import { updateWishlistItemSchema, wishlistQuerySchema } from '@/lib/validations'
import { getWishlistItemById, updateWishlistItem, deleteWishlistItem } from '@/lib/wishlist-service'

export const GET = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const resolvedParams = await params
  const itemId = resolvedParams?.id
  
  if (!itemId) {
    throw createNotFoundError('Wishlist item')
  }

  const query = getValidatedQuery(request, wishlistQuerySchema)
  
  const item = await getWishlistItemById(itemId, user.id, query.includeReservations)
  
  if (!item) {
    throw createNotFoundError('Wishlist item')
  }
  
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
      category: item.category,
      ...(query.includeReservations && { reservations: item.reservations })
    }
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET', 'PUT', 'DELETE']
})

export const PUT = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const resolvedParams = await params
  const itemId = resolvedParams?.id
  
  if (!itemId) {
    throw createNotFoundError('Wishlist item')
  }

  const body = await getValidatedBody(request, updateWishlistItemSchema)
  
  const item = await updateWishlistItem(itemId, user.id, body)
  
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
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET', 'PUT', 'DELETE']
})

export const DELETE = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const resolvedParams = await params
  const itemId = resolvedParams?.id
  
  if (!itemId) {
    throw createNotFoundError('Wishlist item')
  }
  
  await deleteWishlistItem(itemId, user.id)
  
  return createSuccessResponse({
    message: 'Wishlist item deleted successfully'
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET', 'PUT', 'DELETE']
}) 