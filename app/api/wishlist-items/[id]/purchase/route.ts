import { NextRequest } from 'next/server'
import { withMiddleware, getValidatedBody } from '@/lib/api-middleware'
import { createSuccessResponse, createValidationError, createNotFoundError } from '@/lib/api-errors'
import { db } from '@/lib/db'
import { z } from 'zod'

const purchaseSchema = z.object({
  notes: z.string().max(500).optional()
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

  const body = await getValidatedBody(request, purchaseSchema)

  // Find the user's reservation for this item
  const reservation = await db.itemReservation.findFirst({
    where: {
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

  if (!reservation) {
    throw createNotFoundError('You must reserve this item before marking it as purchased')
  }

  // Update reservation to purchased
  const updatedReservation = await db.itemReservation.update({
    where: { id: reservation.id },
    data: {
      status: 'PURCHASED',
      purchasedAt: new Date(),
      purchaseNotes: body.notes
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
      id: updatedReservation.id,
      wishlistItemId: updatedReservation.wishlistItemId,
      status: updatedReservation.status,
      reservedAt: updatedReservation.reservedAt,
      purchasedAt: updatedReservation.purchasedAt,
      purchaseNotes: updatedReservation.purchaseNotes,
      item: updatedReservation.wishlistItem
    }
  })
}, {
  requireAuth: true,
  allowedMethods: ['PUT']
}) 