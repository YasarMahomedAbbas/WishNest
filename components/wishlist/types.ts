export interface WishlistItem {
  id: string
  title: string
  description: string | null
  price: number | null
  productUrl: string | null
  imageUrl: string | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  notes: string | null
  userId: string
  categoryId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
  }
  category: {
    id: string
    name: string
    familyId: string
  }
  status?: 'available' | 'reserved' | 'purchased'
  reservationDetails?: {
    reservedBy?: string
    reservedAt?: string
    purchasedAt?: string
  }
}

export interface Category {
  id: string
  name: string
  description: string | null
  familyId: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Family {
  id: string
  name: string
  description: string | null
  inviteCode: string
  createdAt: string
  updatedAt: string
  membershipRole: 'ADMIN' | 'MEMBER'
  membershipStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  joinedAt: string
}

export interface User {
  id: string
  name: string
  email: string
} 