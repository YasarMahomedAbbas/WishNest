import { db } from './db'
import { hashPassword } from './auth'
import { createConflictError, createValidationError } from './api-errors'

export interface CreateUserData {
  email: string
  password: string
  name: string
  skipEmailValidation?: boolean // For family member creation, we might want to skip complex validation
}

export interface CreatedUser {
  id: string
  email: string
  name: string
}

/**
 * Creates a new user in the database
 * This function can be used by both the registration endpoint and family member creation
 */
export async function createUser({ 
  email, 
  password, 
  name, 
  skipEmailValidation = false 
}: CreateUserData): Promise<CreatedUser> {
  
  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw createConflictError('User with this email already exists')
  }

  // Basic validation
  if (!name?.trim()) {
    throw createValidationError('Name is required')
  }
  
  if (!email?.trim()) {
    throw createValidationError('Email is required')
  }
  
  if (!password?.trim()) {
    throw createValidationError('Password is required')
  }
  
  if (password.length < 6) {
    throw createValidationError('Password must be at least 6 characters')
  }

  // For registration endpoint, we can add stricter validation
  if (!skipEmailValidation) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createValidationError('Invalid email address')
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user
  const user = await db.user.create({
    data: {
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim()
    },
    select: {
      id: true,
      email: true,
      name: true
    }
  })

  return user
}

/**
 * Deletes a user account and all related data
 * This will cascade delete all related records (wishlists, reservations, family memberships, etc.)
 */
export async function deleteUser(userId: string): Promise<{ success: boolean }> {
  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { id: userId }
  })

  if (!existingUser) {
    throw createValidationError('User not found')
  }

  // Delete user (cascade will handle all related records)
  await db.user.delete({
    where: { id: userId }
  })

  return { success: true }
}

/**
 * Adds an existing user to a family
 */
export async function addUserToFamily(userId: string, familyId: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER') {
  // Check if user is already a member
  const existingMembership = await db.familyMember.findUnique({
    where: {
      userId_familyId: {
        userId,
        familyId
      }
    }
  })

  if (existingMembership) {
    throw createValidationError('User is already a member of this family')
  }

  // Check family member limit
  const memberCount = await db.familyMember.count({
    where: {
      familyId,
      status: 'ACTIVE'
    }
  })

  if (memberCount >= 20) {
    throw createValidationError('Family has reached the maximum of 20 members')
  }

  // Add to family
  await db.familyMember.create({
    data: {
      userId,
      familyId,
      role,
      status: 'ACTIVE'
    }
  })
} 