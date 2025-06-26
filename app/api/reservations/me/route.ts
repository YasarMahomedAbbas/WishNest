import { NextRequest } from 'next/server'
import { withMiddleware, getValidatedQuery } from '@/lib/api-middleware'
import { createSuccessResponse } from '@/lib/api-errors'
import { db } from '@/lib/db'
import { z } from 'zod'

const querySchema = z.object({
  status: z.enum(['RESERVED', 'PURCHASED', 'CANCELLED']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10)
})

export const GET = withMiddleware(async (request: NextRequest, { user }) => {
  if (!user) {
    throw new Error('Authentication required')
  }

  const query = getValidatedQuery(request, querySchema)
  const { status, page, limit } = query

  const where = {
    userId: user.id,
    ...(status && { status })
  }

  const [reservations, totalCount] = await Promise.all([
    db.itemReservation.findMany({
      where,
      include: {
        wishlistItem: {
          include: {
            user: { select: { id: true, name: true } },
            category: { select: { id: true, name: true, familyId: true } }
          }
        }
      },
      orderBy: { reservedAt: 'desc' },
      skip: (page! - 1) * limit!,
      take: limit!
    }),
    db.itemReservation.count({ where })
  ])

  return createSuccessResponse({
    reservations: reservations.map(r => ({
      id: r.id,
      wishlistItemId: r.wishlistItemId,
      status: r.status,
      reservedAt: r.reservedAt,
      purchasedAt: r.purchasedAt,
      purchaseNotes: r.purchaseNotes,
      item: {
        id: r.wishlistItem.id,
        title: r.wishlistItem.title,
        description: r.wishlistItem.description,
        price: r.wishlistItem.price ? Number(r.wishlistItem.price) : null,
        productUrl: r.wishlistItem.productUrl,
        imageUrl: r.wishlistItem.imageUrl,
        priority: r.wishlistItem.priority,
        notes: r.wishlistItem.notes,
        userId: r.wishlistItem.userId,
        categoryId: r.wishlistItem.categoryId,
        createdAt: r.wishlistItem.createdAt,
        updatedAt: r.wishlistItem.updatedAt,
        user: r.wishlistItem.user,
        category: r.wishlistItem.category
      }
    })),
    pagination: {
      page: page!,
      limit: limit!,
      totalCount,
      totalPages: Math.ceil(totalCount / limit!)
    }
  })
}, {
  requireAuth: true,
  allowedMethods: ['GET']
}) 