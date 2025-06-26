import { db } from './db'
import { createAuthorizationError, createNotFoundError, createValidationError } from './api-errors'
import { familyAuthMiddleware } from './api-middleware'
import type { ItemPriority, Prisma } from '@prisma/client'

export interface CreateWishlistItemData {
  title: string
  description?: string
  price?: number
  productUrl?: string
  imageUrl?: string
  priority?: ItemPriority
  notes?: string
  categoryId: string
  userId: string
}

export interface UpdateWishlistItemData {
  title?: string
  description?: string
  price?: number
  productUrl?: string
  imageUrl?: string
  priority?: ItemPriority
  notes?: string
  categoryId?: string
}

export interface WishlistItemWithDetails {
  id: string
  title: string
  description: string | null
  price: number | null
  productUrl: string | null
  imageUrl: string | null
  priority: ItemPriority
  notes: string | null
  userId: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string
  }
  category: {
    id: string
    name: string
    familyId: string
  }
  reservations?: Array<{
    id: string
    userId: string
    status: string
    reservedAt: Date
    purchasedAt: Date | null
  }>
}

export interface WishlistQuery {
  familyId?: string
  userId?: string
  categoryId?: string
  priority?: ItemPriority
  minPrice?: number
  maxPrice?: number
  search?: string
  includeReservations?: boolean
  page?: number
  limit?: number
}

/**
 * Creates a new wishlist item
 */
export async function createWishlistItem(data: CreateWishlistItemData): Promise<WishlistItemWithDetails> {
  // Verify category exists and get family ID
  const category = await db.category.findUnique({
    where: { id: data.categoryId },
    include: { family: true }
  })
  
  if (!category) {
    throw createNotFoundError('Category')
  }
  
  // Verify user is a member of the family
  await familyAuthMiddleware(data.userId, category.familyId)
  
  const item = await db.wishlistItem.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      productUrl: data.productUrl,
      imageUrl: data.imageUrl,
      priority: data.priority || 'MEDIUM',
      notes: data.notes,
      userId: data.userId,
      categoryId: data.categoryId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          familyId: true
        }
      }
    }
  })
  
  // Record initial price in price history if provided
  if (data.price) {
    await db.priceHistory.create({
      data: {
        wishlistItemId: item.id,
        price: data.price
      }
    })
  }
  
  return item as WishlistItemWithDetails
}

/**
 * Gets a single wishlist item by ID
 */
export async function getWishlistItemById(itemId: string, requestingUserId: string, includeReservations = false): Promise<WishlistItemWithDetails | null> {
  const item = await db.wishlistItem.findUnique({
    where: { id: itemId },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          familyId: true
        }
      },
      reservations: includeReservations ? {
        select: {
          id: true,
          userId: true,
          status: true,
          reservedAt: true,
          purchasedAt: true
        }
      } : false
    }
  })
  
  if (!item) {
    return null
  }
  
  // Verify user has access to this item (must be in same family)
  await familyAuthMiddleware(requestingUserId, item.category.familyId)
  
  return item as WishlistItemWithDetails
}

/**
 * Gets wishlist items for a specific user
 */
export async function getUserWishlistItems(userId: string, requestingUserId: string, query: WishlistQuery = {}): Promise<{ items: WishlistItemWithDetails[], totalCount: number }> {
  // If requesting own items, no additional auth needed
  // If requesting someone else's items, verify they're in same family
  if (userId !== requestingUserId) {
    // Get a sample item to check family membership
    const sampleItem = await db.wishlistItem.findFirst({
      where: { userId },
      include: { category: { select: { familyId: true } } }
    })
    
    if (sampleItem) {
      await familyAuthMiddleware(requestingUserId, sampleItem.category.familyId)
    }
  }
  
  const {
    categoryId,
    priority,
    minPrice,
    maxPrice,
    search,
    includeReservations = false,
    page = 1,
    limit = 10
  } = query
  
  const where: Prisma.WishlistItemWhereInput = {
    userId,
    ...(categoryId && { categoryId }),
    ...(priority && { priority }),
    ...(minPrice !== undefined && { price: { gte: minPrice } }),
    ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    })
  }
  
  const [items, totalCount] = await Promise.all([
    db.wishlistItem.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            familyId: true
          }
        },
        reservations: includeReservations ? {
          select: {
            id: true,
            userId: true,
            status: true,
            reservedAt: true,
            purchasedAt: true
          }
        } : false
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    db.wishlistItem.count({ where })
  ])
  
  return {
    items: items as WishlistItemWithDetails[],
    totalCount
  }
}

/**
 * Gets all wishlist items for a family
 */
export async function getFamilyWishlistItems(familyId: string, requestingUserId: string, query: WishlistQuery = {}): Promise<{ items: WishlistItemWithDetails[], totalCount: number }> {
  // Verify user is a member of the family
  await familyAuthMiddleware(requestingUserId, familyId)
  
  const {
    userId: filterUserId,
    categoryId,
    priority,
    minPrice,
    maxPrice,
    search,
    includeReservations = false,
    page = 1,
    limit = 10
  } = query
  
  const where: Prisma.WishlistItemWhereInput = {
    category: { familyId },
    ...(filterUserId && { userId: filterUserId }),
    ...(categoryId && { categoryId }),
    ...(priority && { priority }),
    ...(minPrice !== undefined && { price: { gte: minPrice } }),
    ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    })
  }
  
  const [items, totalCount] = await Promise.all([
    db.wishlistItem.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            familyId: true
          }
        },
        reservations: includeReservations ? {
          select: {
            id: true,
            userId: true,
            status: true,
            reservedAt: true,
            purchasedAt: true
          }
        } : false
      },
      orderBy: [
        { user: { name: 'asc' } },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    }),
    db.wishlistItem.count({ where })
  ])
  
  return {
    items: items as WishlistItemWithDetails[],
    totalCount
  }
}

/**
 * Updates a wishlist item (owner only)
 */
export async function updateWishlistItem(itemId: string, userId: string, data: UpdateWishlistItemData): Promise<WishlistItemWithDetails> {
  // Get existing item and verify ownership
  const existingItem = await db.wishlistItem.findUnique({
    where: { id: itemId },
    include: {
      category: {
        select: {
          id: true,
          familyId: true
        }
      }
    }
  })
  
  if (!existingItem) {
    throw createNotFoundError('Wishlist item')
  }
  
  if (existingItem.userId !== userId) {
    throw createAuthorizationError('You can only edit your own wishlist items')
  }
  
  // If updating category, verify new category exists and is in same family
  if (data.categoryId && data.categoryId !== existingItem.categoryId) {
    const newCategory = await db.category.findUnique({
      where: { id: data.categoryId }
    })
    
    if (!newCategory) {
      throw createNotFoundError('Category')
    }
    
    if (newCategory.familyId !== existingItem.category.familyId) {
      throw createValidationError('Category must belong to the same family')
    }
  }
  
  const updatedItem = await db.wishlistItem.update({
    where: { id: itemId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.productUrl !== undefined && { productUrl: data.productUrl }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          familyId: true
        }
      }
    }
  })
  
  // Record price change in history if price was updated
  if (data.price !== undefined && data.price !== existingItem.price?.toNumber()) {
    await db.priceHistory.create({
      data: {
        wishlistItemId: itemId,
        price: data.price
      }
    })
  }
  
  return updatedItem as WishlistItemWithDetails
}

/**
 * Deletes a wishlist item (owner only)
 */
export async function deleteWishlistItem(itemId: string, userId: string): Promise<void> {
  // Get existing item and verify ownership
  const existingItem = await db.wishlistItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      userId: true
    }
  })
  
  if (!existingItem) {
    throw createNotFoundError('Wishlist item')
  }
  
  if (existingItem.userId !== userId) {
    throw createAuthorizationError('You can only delete your own wishlist items')
  }
  
  // Delete item (cascading deletes will handle reservations and price history)
  await db.wishlistItem.delete({
    where: { id: itemId }
  })
}

/**
 * Gets wishlist statistics for a user
 */
export async function getUserWishlistStats(userId: string) {
  const stats = await db.wishlistItem.groupBy({
    by: ['priority'],
    where: { userId },
    _count: { id: true }
  })
  
  const totalItems = await db.wishlistItem.count({
    where: { userId }
  })
  
  const reservedItems = await db.wishlistItem.count({
    where: {
      userId,
      reservations: {
        some: {
          status: 'RESERVED'
        }
      }
    }
  })
  
  const purchasedItems = await db.wishlistItem.count({
    where: {
      userId,
      reservations: {
        some: {
          status: 'PURCHASED'
        }
      }
    }
  })
  
  return {
    totalItems,
    reservedItems,
    purchasedItems,
    priorityBreakdown: stats.reduce((acc, stat) => {
      acc[stat.priority] = stat._count.id
      return acc
    }, {} as Record<ItemPriority, number>)
  }
} 