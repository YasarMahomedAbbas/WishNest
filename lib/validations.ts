import { z } from 'zod'

// Base validation schemas
export const emailSchema = z.string().email('Invalid email format')
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')

export const idSchema = z.string().cuid('Invalid ID format')
export const urlSchema = z.string().url('Invalid URL format').optional().or(z.literal(''))
export const priceSchema = z.number().positive('Price must be positive').optional()

// Enum schemas
export const familyMemberRoleSchema = z.enum(['ADMIN', 'MEMBER'])
export const familyMemberStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'PENDING'])
export const itemPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
export const reservationStatusSchema = z.enum(['RESERVED', 'PURCHASED', 'CANCELLED'])

// User validation schemas
export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
})

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  email: emailSchema.optional(),
})

// Family validation schemas
export const createFamilySchema = z.object({
  name: z.string().min(1, 'Family name is required').max(100, 'Family name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})

export const updateFamilySchema = z.object({
  name: z.string().min(1, 'Family name is required').max(100, 'Family name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})

export const joinFamilySchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
})

// Family member validation schemas
export const updateFamilyMemberSchema = z.object({
  role: familyMemberRoleSchema.optional(),
  status: familyMemberStatusSchema.optional(),
})

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  familyId: idSchema,
})

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters').optional(),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
})

// Wishlist item validation schemas
export const createWishlistItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  price: priceSchema,
  productUrl: urlSchema,
  imageUrl: urlSchema,
  priority: itemPrioritySchema.default('MEDIUM'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  categoryId: idSchema,
})

export const updateWishlistItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  price: priceSchema,
  productUrl: urlSchema,
  imageUrl: urlSchema,
  priority: itemPrioritySchema.optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  categoryId: idSchema.optional(),
})

// Item reservation validation schemas
export const createReservationSchema = z.object({
  wishlistItemId: idSchema,
})

export const updateReservationSchema = z.object({
  status: reservationStatusSchema.optional(),
  purchaseNotes: z.string().max(500, 'Purchase notes must be less than 500 characters').optional(),
})

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(10),
})

export const familyQuerySchema = z.object({
  includeMembers: z.coerce.boolean().default(false),
  includeCategories: z.coerce.boolean().default(false),
})

export const wishlistQuerySchema = z.object({
  categoryId: idSchema.optional(),
  priority: itemPrioritySchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().max(100).optional(),
  userId: idSchema.optional(),
  includeReservations: z.coerce.boolean().default(false),
}).merge(paginationSchema)

// Common response schemas for type safety
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const familyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  inviteCode: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const categoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  familyId: z.string(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const wishlistItemResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  price: z.number().nullable(),
  productUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
  priority: itemPrioritySchema,
  notes: z.string().nullable(),
  userId: z.string(),
  categoryId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Type exports for use in API handlers
export type RegisterUser = z.infer<typeof registerUserSchema>
export type LoginUser = z.infer<typeof loginUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
export type CreateFamily = z.infer<typeof createFamilySchema>
export type UpdateFamily = z.infer<typeof updateFamilySchema>
export type JoinFamily = z.infer<typeof joinFamilySchema>
export type CreateCategory = z.infer<typeof createCategorySchema>
export type UpdateCategory = z.infer<typeof updateCategorySchema>
export type CreateWishlistItem = z.infer<typeof createWishlistItemSchema>
export type UpdateWishlistItem = z.infer<typeof updateWishlistItemSchema>
export type CreateReservation = z.infer<typeof createReservationSchema>
export type UpdateReservation = z.infer<typeof updateReservationSchema>
export type WishlistQuery = z.infer<typeof wishlistQuerySchema>
export type FamilyQuery = z.infer<typeof familyQuerySchema>
export type Pagination = z.infer<typeof paginationSchema> 