import { db } from './db'
import { hashPassword, verifyPassword } from './auth'
import { createConflictError, createValidationError, createAuthorizationError } from './api-errors'

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

export interface UpdateUserData {
  name?: string
}

export interface UpdatePasswordData {
  currentPassword: string
  newPassword: string
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
 * Updates user profile information
 */
export async function updateUser(userId: string, data: UpdateUserData): Promise<CreatedUser> {
  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { id: userId }
  })

  if (!existingUser) {
    throw createValidationError('User not found')
  }

  // Validate name if provided
  if (data.name !== undefined) {
    if (!data.name?.trim()) {
      throw createValidationError('Name is required')
    }
    
    if (data.name.trim().length < 2) {
      throw createValidationError('Name must be at least 2 characters')
    }
    
    if (data.name.trim().length > 100) {
      throw createValidationError('Name must be less than 100 characters')
    }
  }

  // Update user
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() })
    },
    select: {
      id: true,
      email: true,
      name: true
    }
  })

  return updatedUser
}

/**
 * Updates user password
 */
export async function updateUserPassword(userId: string, data: UpdatePasswordData): Promise<{ success: boolean }> {
  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true
    }
  })

  if (!existingUser) {
    throw createValidationError('User not found')
  }

  // Verify current password
  const isCurrentPasswordValid = await verifyPassword(data.currentPassword, existingUser.password)
  if (!isCurrentPasswordValid) {
    throw createAuthorizationError('Current password is incorrect')
  }

  // Validate new password
  if (!data.newPassword?.trim()) {
    throw createValidationError('New password is required')
  }
  
  if (data.newPassword.length < 8) {
    throw createValidationError('New password must be at least 8 characters')
  }
  
  // Check password strength
  const hasUppercase = /[A-Z]/.test(data.newPassword)
  const hasLowercase = /[a-z]/.test(data.newPassword)
  const hasNumbers = /\d/.test(data.newPassword)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword)
  
  if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChar) {
    throw createValidationError('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  }

  // Check if new password is same as current
  if (data.currentPassword === data.newPassword) {
    throw createValidationError('New password must be different from current password')
  }

  // Hash new password
  const hashedPassword = await hashPassword(data.newPassword)

  // Update password
  await db.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword
    }
  })

  return { success: true }
}

/**
 * Resets a user's password (admin only for family members)
 */
export async function resetUserPassword(adminUserId: string, targetUserId: string, familyId: string, newPassword: string): Promise<{ success: boolean }> {
  // Check if admin user exists and has admin privileges for this family
  const adminMembership = await db.familyMember.findUnique({
    where: {
      userId_familyId: {
        userId: adminUserId,
        familyId
      }
    }
  })

  if (!adminMembership || adminMembership.role !== 'ADMIN' || adminMembership.status !== 'ACTIVE') {
    throw createAuthorizationError('Only family admins can reset member passwords')
  }

  // Check if target user is a member of the same family
  const targetMembership = await db.familyMember.findUnique({
    where: {
      userId_familyId: {
        userId: targetUserId,
        familyId
      }
    }
  })

  if (!targetMembership || targetMembership.status !== 'ACTIVE') {
    throw createValidationError('User is not an active member of this family')
  }

  // Cannot reset password of another admin
  if (targetMembership.role === 'ADMIN') {
    throw createAuthorizationError('Cannot reset passwords of other family admins')
  }

  // Cannot reset own password through this method
  if (adminUserId === targetUserId) {
    throw createValidationError('Cannot reset your own password through family management. Use account settings instead.')
  }

  // Validate new password
  if (!newPassword?.trim()) {
    throw createValidationError('New password is required')
  }
  
  if (newPassword.length < 8) {
    throw createValidationError('New password must be at least 8 characters')
  }
  
  // Check password strength
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumbers = /\d/.test(newPassword)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  
  if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChar) {
    throw createValidationError('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword)

  // Update password
  await db.user.update({
    where: { id: targetUserId },
    data: {
      password: hashedPassword
    }
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