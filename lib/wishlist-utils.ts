import { WishlistItemWithDetails } from './wishlist-service'
import type { ItemPriority, ReservationStatus } from '@prisma/client'

/**
 * Extract domain from a URL for display purposes
 */
export function extractDomain(url: string): string | null {
  try {
    const domain = new URL(url).hostname
    return domain.replace(/^www\./, '')
  } catch (error) {
    return null
  }
}

/**
 * Check if a URL is a valid product URL
 */
export function isValidProductUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch (error) {
    return false
  }
}

/**
 * Extract basic metadata from a product URL
 * This is a simplified version - in a real app you might use web scraping
 */
export function extractProductMetadata(url: string): {
  domain: string | null
  isShoppingSite: boolean
} {
  const domain = extractDomain(url)
  const shoppingSites = [
    'amazon.com',
    'amazon.co.uk',
    'ebay.com',
    'etsy.com',
    'target.com',
    'walmart.com',
    'bestbuy.com',
    'apple.com',
    'nike.com',
    'adidas.com'
  ]
  
  const isShoppingSite = domain ? shoppingSites.some(site => domain.includes(site)) : false
  
  return {
    domain,
    isShoppingSite
  }
}

/**
 * Get the current status of a wishlist item based on reservations
 */
export function getItemStatus(item: WishlistItemWithDetails): {
  status: 'available' | 'reserved' | 'purchased'
  reservedBy?: string
  reservedAt?: Date
  purchasedAt?: Date
} {
  if (!item.reservations || item.reservations.length === 0) {
    return { status: 'available' }
  }
  
  const activeReservation = item.reservations.find(r => r.status === 'RESERVED' || r.status === 'PURCHASED')
  
  if (!activeReservation) {
    return { status: 'available' }
  }
  
  if (activeReservation.status === 'PURCHASED') {
    return {
      status: 'purchased',
      reservedBy: activeReservation.userId,
      reservedAt: activeReservation.reservedAt,
      purchasedAt: activeReservation.purchasedAt || undefined
    }
  }
  
  return {
    status: 'reserved',
    reservedBy: activeReservation.userId,
    reservedAt: activeReservation.reservedAt
  }
}

/**
 * Check if current user can see reservation details
 * Item owners should not see who reserved their items
 */
export function canSeeReservationDetails(item: WishlistItemWithDetails, currentUserId: string): boolean {
  return item.userId !== currentUserId
}

/**
 * Filter item data based on user permissions
 */
export function filterItemForUser(item: WishlistItemWithDetails, currentUserId: string) {
  const itemStatus = getItemStatus(item)
  const canSeeDetails = canSeeReservationDetails(item, currentUserId)
  
  return {
    ...item,
    status: itemStatus.status,
    // Only show reservation details if user is not the item owner
    reservationDetails: canSeeDetails ? {
      reservedBy: itemStatus.reservedBy,
      reservedAt: itemStatus.reservedAt,
      purchasedAt: itemStatus.purchasedAt
    } : undefined
  }
}

/**
 * Get priority display information
 */
export function getPriorityInfo(priority: ItemPriority): {
  label: string
  color: string
  sortOrder: number
} {
  switch (priority) {
    case 'URGENT':
      return { label: 'Urgent', color: 'red', sortOrder: 1 }
    case 'HIGH':
      return { label: 'High', color: 'orange', sortOrder: 2 }
    case 'MEDIUM':
      return { label: 'Medium', color: 'blue', sortOrder: 3 }
    case 'LOW':
      return { label: 'Low', color: 'gray', sortOrder: 4 }
    default:
      return { label: 'Medium', color: 'blue', sortOrder: 3 }
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) {
    return 'Price not set'
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

/**
 * Calculate price trend based on price history
 */
export function calculatePriceTrend(currentPrice: number, previousPrice: number): {
  trend: 'up' | 'down' | 'stable'
  change: number
  changePercentage: number
} {
  if (currentPrice === previousPrice) {
    return { trend: 'stable', change: 0, changePercentage: 0 }
  }
  
  const change = currentPrice - previousPrice
  const changePercentage = (change / previousPrice) * 100
  
  return {
    trend: change > 0 ? 'up' : 'down',
    change,
    changePercentage
  }
}

/**
 * Group wishlist items by category
 */
export function groupItemsByCategory(items: WishlistItemWithDetails[]): Record<string, WishlistItemWithDetails[]> {
  return items.reduce((groups, item) => {
    const categoryName = item.category.name
    if (!groups[categoryName]) {
      groups[categoryName] = []
    }
    groups[categoryName].push(item)
    return groups
  }, {} as Record<string, WishlistItemWithDetails[]>)
}

/**
 * Sort items by priority and creation date
 */
export function sortItemsByPriority(items: WishlistItemWithDetails[]): WishlistItemWithDetails[] {
  return items.sort((a, b) => {
    const aPriority = getPriorityInfo(a.priority)
    const bPriority = getPriorityInfo(b.priority)
    
    // First sort by priority (lower sortOrder = higher priority)
    if (aPriority.sortOrder !== bPriority.sortOrder) {
      return aPriority.sortOrder - bPriority.sortOrder
    }
    
    // Then sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

/**
 * Check if item matches search criteria
 */
export function itemMatchesSearch(item: WishlistItemWithDetails, searchTerm: string): boolean {
  const search = searchTerm.toLowerCase()
  return (
    item.title.toLowerCase().includes(search) ||
    (item.description?.toLowerCase().includes(search) ?? false) ||
    item.category.name.toLowerCase().includes(search) ||
    (item.notes?.toLowerCase().includes(search) ?? false)
  )
}

/**
 * Generate item summary for notifications/emails
 */
export function generateItemSummary(item: WishlistItemWithDetails): string {
  const parts = [item.title]
  
  if (item.price) {
    parts.push(`(${formatPrice(item.price)})`)
  }
  
  if (item.category.name !== 'Other') {
    parts.push(`in ${item.category.name}`)
  }
  
  return parts.join(' ')
} 