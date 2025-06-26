import { NextRequest } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { createSuccessResponse, createValidationError, createNotFoundError } from '@/lib/api-errors'
import { getWishlistItemById } from '@/lib/wishlist-service'
import { db } from '@/lib/db'

// Reserve an item
export const POST = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const resolvedParams = await params
  const itemId = resolvedParams?.id
  
  if (!itemId) {
    throw createNotFoundError('Wishlist item')
  }

  // Get the item and verify access (must be in same family)
  const item = await getWishlistItemById(itemId, user.id, true)
  
  if (!item) {
    throw createNotFoundError('Wishlist item')
  }

  // Prevent users from reserving their own items
  if (item.userId === user.id) {
    throw createValidationError('You cannot reserve your own items')
  }

  // Check if item is already reserved
  const existingReservation = item.reservations?.find(r => r.status === 'RESERVED' || r.status === 'PURCHASED')
  if (existingReservation) {
    throw createValidationError('This item is already reserved')
  }

  // Create reservation
  const reservation = await db.itemReservation.create({
    data: {
      wishlistItemId: itemId,
      userId: user.id,
      status: 'RESERVED'
    },
    include: {
      wishlistItem: {
        include: {
          user: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, familyId: true } }
        }
      }
    }
  })

  return createSuccessResponse({
    reservation: {
      id: reservation.id,
      wishlistItemId: reservation.wishlistItemId,
      status: reservation.status,
      reservedAt: reservation.reservedAt,
      item: reservation.wishlistItem
    }
  }, 201)
}, {
  requireAuth: true,
  allowedMethods: ['POST', 'DELETE']
})

// Cancel reservation
export const DELETE = withMiddleware(async (request: NextRequest, { user, params }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const resolvedParams = await params
  const itemId = resolvedParams?.id
  
  if (!itemId) {
    throw createNotFoundError('Wishlist item')
  }

  // Find the user's reservation for this item
  const reservation = await db.itemReservation.findFirst({
    where: {
      wishlistItemId: itemId,
      userId: user.id,
      status: 'RESERVED' // Can only cancel reserved items, not purchased ones
    }
  })

  if (!reservation) {
    throw createNotFoundError('Reservation not found or cannot be cancelled')
  }

  // Delete the reservation
  await db.itemReservation.delete({
    where: { id: reservation.id }
  })

  return createSuccessResponse({
    message: 'Reservation cancelled successfully'
  })
}, {
  requireAuth: true,
  allowedMethods: ['POST', 'DELETE']
}) 