import jwt, { SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { db } from './db'
import { createAuthenticationError } from './api-errors'

// Types
export interface TokenPayload {
  userId: string
  email: string
  type: 'access' | 'refresh'
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface UserSession {
  id: string
  email: string
  name: string
}

// Constants
const JWT_SECRET = process.env.JWT_SECRET as string
const ACCESS_TOKEN_EXPIRES_IN = (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '4h') as string
const REFRESH_TOKEN_EXPIRES_IN = (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d') as string
const REMEMBER_ME_EXPIRES_IN = (process.env.JWT_REMEMBER_ME_EXPIRES_IN || '30d') as string
const BCRYPT_COST_FACTOR = 12

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_COST_FACTOR)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// JWT utilities
export function generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN } as SignOptions
  )
}

export function generateRefreshToken(payload: Omit<TokenPayload, 'type'>, rememberMe = false): string {
  const expiresIn = rememberMe ? REMEMBER_ME_EXPIRES_IN : REFRESH_TOKEN_EXPIRES_IN
  return jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    { expiresIn } as SignOptions
  )
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    throw createAuthenticationError('Invalid or expired token')
  }
}

// Token management
export async function createTokens(userId: string, email: string, rememberMe = false): Promise<AuthTokens> {
  const payload = { userId, email }
  
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload, rememberMe)
  
  // Store refresh token in database
  const expiresAt = new Date()
  const expiresInMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days
  expiresAt.setTime(expiresAt.getTime() + expiresInMs)
  
  await db.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    }
  })
  
  return { accessToken, refreshToken }
}

export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    // Verify refresh token
    const payload = verifyToken(refreshToken)
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type')
    }
    
    // Check if refresh token exists and is not revoked
    const storedToken = await db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    })
    
    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return null
    }
    
    // Generate new access token
    return generateAccessToken({
      userId: payload.userId,
      email: payload.email
    })
  } catch {
    return null
  }
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    await db.refreshToken.update({
      where: { token: refreshToken },
      data: { isRevoked: true }
    })
  } catch {
    // Token doesn't exist or already revoked
  }
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await db.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true }
  })
}

// Account lockout utilities
export async function incrementFailedAttempts(email: string): Promise<void> {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return
  
  const newFailedAttempts = user.failedLoginAttempts + 1
  const lockoutUntil = newFailedAttempts >= 5 
    ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    : null
  
  await db.user.update({
    where: { email },
    data: {
      failedLoginAttempts: newFailedAttempts,
      lockoutUntil
    }
  })
}

export async function resetFailedAttempts(email: string): Promise<void> {
  await db.user.update({
    where: { email },
    data: {
      failedLoginAttempts: 0,
      lockoutUntil: null
    }
  })
}

export async function isAccountLocked(email: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return false
  
  return user.lockoutUntil ? user.lockoutUntil > new Date() : false
}

// Session utilities
export async function getUserFromAccessToken(token: string): Promise<UserSession | null> {
  try {
    const payload = verifyToken(token)
    
    if (payload.type !== 'access') {
      return null
    }
    
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true
      }
    })
    
    return user
  } catch {
    return null
  }
}

// Cookie utilities
export async function setAuthCookies(accessToken: string, refreshToken: string, rememberMe = false) {
  const cookieStore = await cookies()
  
  // Set access token cookie (4 hours to match JWT expiration)
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 4 * 60 * 60 // 4 hours
  })
  
  // Set refresh token cookie (longer-lived, httpOnly)
  const refreshMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // 30 days or 7 days
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: refreshMaxAge
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  
  cookieStore.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0
  })
  
  cookieStore.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0
  })
}

export async function getTokensFromCookies(): Promise<{ accessToken: string | null, refreshToken: string | null }> {
  const cookieStore = await cookies()
  
  return {
    accessToken: cookieStore.get('access_token')?.value || null,
    refreshToken: cookieStore.get('refresh_token')?.value || null
  }
}

// Email verification utilities
export function generateEmailVerifyToken(): string {
  return jwt.sign(
    { type: 'email_verify', timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '24h' } as SignOptions
  )
}

export function verifyEmailToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    return payload.type === 'email_verify'
  } catch {
    return false
  }
}

// Password reset utilities
export function generatePasswordResetToken(): string {
  return jwt.sign(
    { type: 'password_reset', timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '1h' } as SignOptions
  )
}

export function verifyPasswordResetToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    return payload.type === 'password_reset'
  } catch {
    return false
  }
} 