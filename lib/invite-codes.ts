import { db } from './db'

/**
 * Generates a secure random invite code for families
 * Format: 8 characters using alphanumeric characters (uppercase + numbers)
 * Excludes confusing characters like 0, O, 1, I, L
 */
export function generateInviteCode(): string {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
  let result = ''
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Generates a unique invite code that doesn't exist in the database
 * Will retry up to 10 times if there are collisions
 */
export async function generateUniqueInviteCode(): Promise<string> {
  const maxRetries = 10
  
  for (let i = 0; i < maxRetries; i++) {
    const code = generateInviteCode()
    
    // Check if code already exists
    const existing = await db.family.findUnique({
      where: { inviteCode: code },
      select: { id: true }
    })
    
    if (!existing) {
      return code
    }
  }
  
  throw new Error('Failed to generate unique invite code after maximum retries')
}

/**
 * Validates an invite code format
 */
export function validateInviteCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false
  }
  
  // Must be exactly 8 characters
  if (code.length !== 8) {
    return false
  }
  
  // Must only contain valid characters
  const validChars = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$/
  return validChars.test(code)
}

/**
 * Checks if an invite code exists and is valid
 */
export async function validateInviteCode(code: string): Promise<{ valid: boolean; familyId?: string }> {
  if (!validateInviteCodeFormat(code)) {
    return { valid: false }
  }
  
  const family = await db.family.findUnique({
    where: { inviteCode: code },
    select: { id: true }
  })
  
  return family ? { valid: true, familyId: family.id } : { valid: false }
} 