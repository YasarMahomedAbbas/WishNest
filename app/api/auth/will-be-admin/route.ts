import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withMiddleware, getValidatedQuery } from '@/lib/api-middleware'
import { createSuccessResponse } from '@/lib/api-errors'
import { db } from '@/lib/db'

const querySchema = z.object({
  email: z.string().email('Invalid email address')
})

export const GET = withMiddleware(async (request: NextRequest) => {
  const { email } = getValidatedQuery(request, querySchema)

  const normalizedEmail = email.trim().toLowerCase()

  const userCount = await db.user.count()
  const isFirstUser = userCount === 0

  const envAdminEmailsRaw = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').toString()
  const envAdminEmails = envAdminEmailsRaw
    .split(/[;,\s]+/)
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  const matchesAdminEnv = envAdminEmails.includes(normalizedEmail)

  const willBeAdmin = isFirstUser || matchesAdminEnv
  const reason: 'first_user' | 'env_match' | null = willBeAdmin
    ? (isFirstUser ? 'first_user' : 'env_match')
    : null

  return createSuccessResponse({
    willBeAdmin,
    reason
  })
}, {
  requireAuth: false,
  allowedMethods: ['GET']
})

